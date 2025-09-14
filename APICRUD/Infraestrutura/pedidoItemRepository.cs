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
                "INSERT INTO pedidoitens (pedidoid, itemid, quantidade) VALUES (@pedidoid, @itemid, @quantidade) RETURNING id",
                connection);
            
            command.Parameters.AddWithValue("@pedidoid", pedidoItem.pedidoid);
            command.Parameters.AddWithValue("@itemid", pedidoItem.itemid);
            command.Parameters.AddWithValue("@quantidade", pedidoItem.quantidade);
            
            pedidoItem.id = (int)command.ExecuteScalar()!;
        }

        public List<pedidoItem> Get()
        {
            using var connection = _dbConnection.GetConnection();
            using var command = new NpgsqlCommand("SELECT id, pedidoid, itemid, quantidade FROM pedidoitens", connection);
            using var reader = command.ExecuteReader();
            
            var pedidoItens = new List<pedidoItem>();
            while (reader.Read())
            {
                pedidoItens.Add(new pedidoItem
                {
                    id = reader.GetInt32(0),
                    pedidoid = reader.GetInt32(1),
                    itemid = reader.GetInt32(2),
                    quantidade = reader.GetInt32(3)
                });
            }
            return pedidoItens;
        }
    }
}

