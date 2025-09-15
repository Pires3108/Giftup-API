using APICRUD.Model;
using Npgsql;

namespace APICRUD.Infraestrutura
{
    public class pedidoItemRepository : IpedidoItemRepository
    {
        private readonly DatabaseConnection _dbConnection;

        public pedidoItemRepository(DatabaseConnection dbConnection)
        {
            _dbConnection = dbConnection ?? throw new ArgumentNullException(nameof(dbConnection));
        }

        public void AddPedidoItem(pedidoItem pedidoItem)
        {
            using var connection = _dbConnection.GetConnection();
            using var command = new NpgsqlCommand(
                "INSERT INTO pedido_itens (pedido_id, item_id, quantidade) VALUES (@pedido_id, @item_id, @quantidade) RETURNING id",
                connection);
            
            command.Parameters.AddWithValue("@pedido_id", pedidoItem.pedido_id);
            command.Parameters.AddWithValue("@item_id", pedidoItem.item_id);
            command.Parameters.AddWithValue("@quantidade", pedidoItem.quantidade);
            
            pedidoItem.id = (int)command.ExecuteScalar()!;
        }

        public List<pedidoItem> Get()
        {
            using var connection = _dbConnection.GetConnection();
            using var command = new NpgsqlCommand("SELECT id, pedido_id, item_id, quantidade FROM pedido_itens", connection);
            using var reader = command.ExecuteReader();
            
            var pedidoItens = new List<pedidoItem>();
            while (reader.Read())
            {
                pedidoItens.Add(new pedidoItem
                {
                    id = reader.GetInt32(0),
                    pedido_id = reader.GetInt32(1),
                    item_id = reader.GetInt32(2),
                    quantidade = reader.GetInt32(3)
                });
            }
            return pedidoItens;
        }
    }
}

