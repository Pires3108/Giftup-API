using APICRUD.Model;
using Npgsql;

namespace APICRUD.Infraestrutura
{
    public class itemRepository : IitemRepository
    {
        private readonly DatabaseConnection _dbConnection;

        public itemRepository(DatabaseConnection dbConnection)
        {
            _dbConnection = dbConnection ?? throw new ArgumentNullException(nameof(dbConnection));
        }

        public List<item> Get()
        {
            try
            {
                using var connection = _dbConnection.GetConnection();
                using var command = new NpgsqlCommand("SELECT id, nome_item, preco_item, foto_item, COALESCE(descricao_item, '') as descricao_item FROM itens", connection);
                using var reader = command.ExecuteReader();
                
                var itens = new List<item>();
                while (reader.Read())
                {
                    itens.Add(new item
                    {
                        id = reader.GetInt32(0),
                        nome_item = reader.GetString(1),
                        preco_item = reader.GetDecimal(2),
                        foto_item = reader.GetString(3),
                        descricao_item = reader.GetString(4)
                    });
                }
                return itens;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar itens: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw new Exception($"Erro ao conectar com o banco de dados: {ex.Message}", ex);
            }
        }

        public void AddItem(item item)
        {
            using var connection = _dbConnection.GetConnection();
            var checkColumnQuery = "SELECT column_name FROM information_schema.columns WHERE table_name = 'itens' AND column_name = 'descricao_item'";
            bool hasDescricaoColumn = false;
            
            using (var checkCommand = new NpgsqlCommand(checkColumnQuery, connection))
            {
                using var checkReader = checkCommand.ExecuteReader();
                hasDescricaoColumn = checkReader.HasRows;
            }
            
            string insertQuery;
            if (hasDescricaoColumn)
            {
                insertQuery = "INSERT INTO itens (nome_item, preco_item, foto_item, descricao_item) VALUES (@nome, @preco, @foto, @descricao) RETURNING id";
            }
            else
            {
                insertQuery = "INSERT INTO itens (nome_item, preco_item, foto_item) VALUES (@nome, @preco, @foto) RETURNING id";
            }
            
            using var command = new NpgsqlCommand(insertQuery, connection);
            
            command.Parameters.AddWithValue("@nome", item.nome_item);
            command.Parameters.AddWithValue("@preco", item.preco_item);
            command.Parameters.AddWithValue("@foto", item.foto_item);
            if (hasDescricaoColumn)
            {
                command.Parameters.AddWithValue("@descricao", item.descricao_item);
            }
            
            item.id = (int)command.ExecuteScalar()!;
        }

        public void DeleteItem(item item) 
        {
            using var connection = _dbConnection.GetConnection();
            using var command = new NpgsqlCommand("DELETE FROM itens WHERE id = @id", connection);
            command.Parameters.AddWithValue("@id", item.id);
            command.ExecuteNonQuery();
        }

        public void UpdateItem(item item)
        {
            using var connection = _dbConnection.GetConnection();
            var checkColumnQuery = "SELECT column_name FROM information_schema.columns WHERE table_name = 'itens' AND column_name = 'descricao_item'";
            bool hasDescricaoColumn = false;
            
            using (var checkCommand = new NpgsqlCommand(checkColumnQuery, connection))
            {
                using var checkReader = checkCommand.ExecuteReader();
                hasDescricaoColumn = checkReader.HasRows;
            }
            
            string updateQuery;
            if (hasDescricaoColumn)
            {
                updateQuery = "UPDATE itens SET nome_item = @nome, preco_item = @preco, foto_item = @foto, descricao_item = @descricao WHERE id = @id";
            }
            else
            {
                updateQuery = "UPDATE itens SET nome_item = @nome, preco_item = @preco, foto_item = @foto WHERE id = @id";
            }
            
            using var command = new NpgsqlCommand(updateQuery, connection);
            
            command.Parameters.AddWithValue("@nome", item.nome_item);
            command.Parameters.AddWithValue("@preco", item.preco_item);
            command.Parameters.AddWithValue("@foto", item.foto_item);
            command.Parameters.AddWithValue("@id", item.id);
            
            if (hasDescricaoColumn)
            {
                command.Parameters.AddWithValue("@descricao", item.descricao_item);
            }
            
            command.ExecuteNonQuery();
        }

        public item? GetItem(int id)
        {
            using var connection = _dbConnection.GetConnection();
            using var command = new NpgsqlCommand("SELECT id, nome_item, preco_item, foto_item, COALESCE(descricao_item, '') as descricao_item FROM itens WHERE id = @id", connection);
            command.Parameters.AddWithValue("@id", id);
            
            using var reader = command.ExecuteReader();
            if (reader.Read())
            {
                return new item
                {
                    id = reader.GetInt32(0),
                    nome_item = reader.GetString(1),
                    preco_item = reader.GetDecimal(2),
                    foto_item = reader.GetString(3),
                    descricao_item = reader.GetString(4)
                };
            }
            return null;
        }
    }
}
