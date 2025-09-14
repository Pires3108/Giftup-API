using APICRUD.DTO;
using APICRUD.Model;
using Npgsql;

namespace APICRUD.Infraestrutura
{
    public class pedidoRepository : IpedidoRepository
    {
        private readonly DatabaseConnection _dbConnection;

        public pedidoRepository(DatabaseConnection dbConnection)
        {
            _dbConnection = dbConnection ?? throw new ArgumentNullException(nameof(dbConnection));
        }

        public List<pedido> Get()
        {
            using var connection = _dbConnection.GetConnection();
            using var command = new NpgsqlCommand(@"
                SELECT p.id, p.cliente_id, p.status_pedido, 
                       pi.id as pedidoitem_id, pi.pedidoid, pi.itemid, pi.quantidade,
                       i.nome_item, i.preco_item, i.foto_item,
                       c.nome_cliente, c.datanascimento_cliente, c.email_cliente
                FROM pedidos p
                LEFT JOIN pedidoitens pi ON p.id = pi.pedidoid
                LEFT JOIN itens i ON pi.itemid = i.id
                LEFT JOIN clientes c ON p.cliente_id = c.id
                ORDER BY p.id, pi.id", connection);
            
            using var reader = command.ExecuteReader();
            var pedidosDict = new Dictionary<int, pedido>();
            
            while (reader.Read())
            {
                var pedidoId = reader.GetInt32(0);
                
                if (!pedidosDict.ContainsKey(pedidoId))
                {
                    pedidosDict[pedidoId] = new pedido
                    {
                        id = pedidoId,
                        cliente_id = reader.GetInt32(1),
                        status_pedido = reader.GetInt32(2),
                        PedidoItens = new List<pedidoItem>()
                    };
                }
                
                if (!reader.IsDBNull(3))
                {
                    var pedidoItem = new pedidoItem
                    {
                        id = reader.GetInt32(3),
                        pedidoid = reader.GetInt32(4),
                        itemid = reader.GetInt32(5),
                        quantidade = reader.GetInt32(6)
                    };
                    
                    if (!reader.IsDBNull(7))
                    {
                        pedidoItem.itens = new item
                        {
                            id = reader.GetInt32(5),
                            nome_item = reader.GetString(7),
                            preco_item = reader.GetDecimal(8),
                            foto_item = reader.GetString(9)
                        };
                    }
                    
                    pedidosDict[pedidoId].PedidoItens.Add(pedidoItem);
                }
            }
            
            return pedidosDict.Values.ToList();
        }

        public List<PedidoDTO> GetByClienteId(int clienteId)
        {
            using var connection = _dbConnection.GetConnection();
            using var command = new NpgsqlCommand(@"
                SELECT p.id, pi.itemid, pi.quantidade, i.nome_item, i.preco_item
                FROM pedidos p
                LEFT JOIN pedidoitens pi ON p.id = pi.pedidoid
                LEFT JOIN itens i ON pi.itemid = i.id
                WHERE p.cliente_id = @clienteId
                ORDER BY p.id, pi.id", connection);
            
            command.Parameters.AddWithValue("@clienteId", clienteId);
            using var reader = command.ExecuteReader();
            
            var pedidosDict = new Dictionary<int, PedidoDTO>();
            
            while (reader.Read())
            {
                var pedidoId = reader.GetInt32(0);
                
                if (!pedidosDict.ContainsKey(pedidoId))
                {
                    pedidosDict[pedidoId] = new PedidoDTO
                    {
                        Id = pedidoId,
                        Items = new List<PedidoItemResponseDTO>(),
                        Total = 0
                    };
                }
                
                if (!reader.IsDBNull(1))
                {
                    var nome = reader.IsDBNull(3) ? "Sem nome" : reader.GetString(3);
                    var preco = reader.IsDBNull(4) ? 0m : reader.GetDecimal(4);
                    var quantidade = reader.GetInt32(2);
                    
                    var item = new PedidoItemResponseDTO
                    {
                        Nome = nome,
                        Preco = preco,
                        Quantidade = quantidade,
                        ItemId = reader.GetInt32(1)
                    };
                    
                    pedidosDict[pedidoId].Items.Add(item);
                    pedidosDict[pedidoId].Total += preco * quantidade;
                }
            }
            
            return pedidosDict.Values.ToList();
        }

        public void AddPedido(pedido pedido)
        {
            using var connection = _dbConnection.GetConnection();
            using var transaction = connection.BeginTransaction();
            
            try
            {
                using var pedidoCommand = new NpgsqlCommand(
                    "INSERT INTO pedidos (cliente_id, status_pedido) VALUES (@clienteId, @status) RETURNING id",
                    connection, transaction);
                
                pedidoCommand.Parameters.AddWithValue("@clienteId", pedido.cliente_id);
                pedidoCommand.Parameters.AddWithValue("@status", pedido.status_pedido);
                
                var pedidoId = (int)pedidoCommand.ExecuteScalar()!;
                pedido.id = pedidoId;
                
                Console.WriteLine($"Pedido salvo com ID: {pedidoId}");
                
                foreach (var item in pedido.PedidoItens)
                {
                    using var itemCommand = new NpgsqlCommand(
                        "INSERT INTO pedidoitens (pedidoid, itemid, quantidade) VALUES (@pedidoid, @itemid, @quantidade)",
                        connection, transaction);
                    
                    itemCommand.Parameters.AddWithValue("@pedidoid", pedidoId);
                    itemCommand.Parameters.AddWithValue("@itemid", item.itemid);
                    itemCommand.Parameters.AddWithValue("@quantidade", item.quantidade);
                    
                    itemCommand.ExecuteNonQuery();
                    Console.WriteLine($"Adicionando item: pedidoid={pedidoId}, itemid={item.itemid}, quantidade={item.quantidade}");
                }
                
                transaction.Commit();
                Console.WriteLine("Itens salvos com sucesso!");
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                Console.WriteLine($"Erro ao salvar pedido: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        public void DeletePedido(int clienteId, int pedidoId)
        {
            using var connection = _dbConnection.GetConnection();
            using var transaction = connection.BeginTransaction();
            
            try
            {
                using var checkCommand = new NpgsqlCommand(
                    "SELECT id FROM pedidos WHERE id = @pedidoId AND cliente_id = @clienteId",
                    connection, transaction);
                
                checkCommand.Parameters.AddWithValue("@pedidoId", pedidoId);
                checkCommand.Parameters.AddWithValue("@clienteId", clienteId);
                
                var exists = checkCommand.ExecuteScalar();
                if (exists == null)
                    throw new Exception("Pedido não encontrado ou não pertence ao cliente.");

                using var deleteItemsCommand = new NpgsqlCommand(
                    "DELETE FROM pedidoitens WHERE pedidoid = @pedidoId",
                    connection, transaction);
                
                deleteItemsCommand.Parameters.AddWithValue("@pedidoId", pedidoId);
                deleteItemsCommand.ExecuteNonQuery();

                using var deletePedidoCommand = new NpgsqlCommand(
                    "DELETE FROM pedidos WHERE id = @pedidoId",
                    connection, transaction);
                
                deletePedidoCommand.Parameters.AddWithValue("@pedidoId", pedidoId);
                deletePedidoCommand.ExecuteNonQuery();

                transaction.Commit();
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        public void DeletePedidoById(int pedidoId)
        {
            using var connection = _dbConnection.GetConnection();
            using var transaction = connection.BeginTransaction();
            
            try
            {
                using var checkCommand = new NpgsqlCommand(
                    "SELECT id FROM pedidos WHERE id = @pedidoId",
                    connection, transaction);
                
                checkCommand.Parameters.AddWithValue("@pedidoId", pedidoId);
                
                var exists = checkCommand.ExecuteScalar();
                if (exists == null)
                    throw new Exception("Pedido não encontrado.");

                using var deleteItemsCommand = new NpgsqlCommand(
                    "DELETE FROM pedidoitens WHERE pedidoid = @pedidoId",
                    connection, transaction);
                
                deleteItemsCommand.Parameters.AddWithValue("@pedidoId", pedidoId);
                deleteItemsCommand.ExecuteNonQuery();

                using var deletePedidoCommand = new NpgsqlCommand(
                    "DELETE FROM pedidos WHERE id = @pedidoId",
                    connection, transaction);
                
                deletePedidoCommand.Parameters.AddWithValue("@pedidoId", pedidoId);
                deletePedidoCommand.ExecuteNonQuery();

                transaction.Commit();
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        public void UpdatePedido(int id, int cliente_id, List<PedidoitemDTO> itens)
        {
            using var connection = _dbConnection.GetConnection();
            using var transaction = connection.BeginTransaction();
            
            try
            {
                using var checkCommand = new NpgsqlCommand(
                    "SELECT id FROM pedidos WHERE id = @pedidoId",
                    connection, transaction);
                
                checkCommand.Parameters.AddWithValue("@pedidoId", id);
                
                var exists = checkCommand.ExecuteScalar();
                if (exists == null)
                    throw new Exception("Pedido não encontrado.");

                using var updatePedidoCommand = new NpgsqlCommand(
                    "UPDATE pedidos SET cliente_id = @clienteId WHERE id = @pedidoId",
                    connection, transaction);
                
                updatePedidoCommand.Parameters.AddWithValue("@clienteId", cliente_id);
                updatePedidoCommand.Parameters.AddWithValue("@pedidoId", id);
                updatePedidoCommand.ExecuteNonQuery();

                using var deleteItemsCommand = new NpgsqlCommand(
                    "DELETE FROM pedidoitens WHERE pedidoid = @pedidoId",
                    connection, transaction);
                
                deleteItemsCommand.Parameters.AddWithValue("@pedidoId", id);
                deleteItemsCommand.ExecuteNonQuery();

                foreach (var item in itens)
                {
                    using var insertItemCommand = new NpgsqlCommand(
                        "INSERT INTO pedidoitens (pedidoid, itemid, quantidade) VALUES (@pedidoid, @itemid, @quantidade)",
                        connection, transaction);
                    
                    insertItemCommand.Parameters.AddWithValue("@pedidoid", id);
                    insertItemCommand.Parameters.AddWithValue("@itemid", item.item_id);
                    insertItemCommand.Parameters.AddWithValue("@quantidade", item.quantidade);
                    insertItemCommand.ExecuteNonQuery();
                }

                transaction.Commit();
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
