using APICRUD.Model;
using Npgsql;

namespace APICRUD.Infraestrutura
{
    public class clienteRepository : IclienteRepository
    {
        private readonly DatabaseConnection _dbConnection;

        public clienteRepository(DatabaseConnection dbConnection)
        {
            _dbConnection = dbConnection ?? throw new ArgumentNullException(nameof(dbConnection));
        }

        public void AddCliente(cliente cliente)
        {
            using var connection = _dbConnection.GetConnection();
            using var command = new NpgsqlCommand(
                "INSERT INTO clientes (nome_cliente, datanascimento_cliente, email_cliente, senha) VALUES (@nome, @dataNascimento, @email, @senha) RETURNING id",
                connection);
            
            command.Parameters.AddWithValue("@nome", cliente.nome_cliente);
            command.Parameters.AddWithValue("@dataNascimento", cliente.datanascimento_cliente);
            command.Parameters.AddWithValue("@email", cliente.email_cliente);
            command.Parameters.AddWithValue("@senha", cliente.senha);
            
            cliente.id = (int)command.ExecuteScalar()!;
        }

        public void UpdateCliente(cliente cliente)
        {
            using var connection = _dbConnection.GetConnection();
            
            string sql = "UPDATE clientes SET nome_cliente = @nome, datanascimento_cliente = @dataNascimento, email_cliente = @email";
            var parameters = new List<NpgsqlParameter>
            {
                new("@nome", cliente.nome_cliente),
                new("@dataNascimento", cliente.datanascimento_cliente),
                new("@email", cliente.email_cliente),
                new("@id", cliente.id)
            };

            if (!string.IsNullOrWhiteSpace(cliente.senha))
            {
                sql += ", senha = @senha";
                parameters.Add(new("@senha", BCrypt.Net.BCrypt.HashPassword(cliente.senha)));
            }

            sql += " WHERE id = @id";

            using var command = new NpgsqlCommand(sql, connection);
            command.Parameters.AddRange(parameters.ToArray());
            command.ExecuteNonQuery();
        }

        public void DeleteCliente(int id)
        {
            using var connection = _dbConnection.GetConnection();
            using var transaction = connection.BeginTransaction();
            
            try
            {
                using var deletePedidoItensCommand = new NpgsqlCommand(
                    "DELETE FROM pedido_itens WHERE pedido_id IN (SELECT id FROM pedidos WHERE cliente_id = @id)", 
                    connection, transaction);
                deletePedidoItensCommand.Parameters.AddWithValue("@id", id);
                deletePedidoItensCommand.ExecuteNonQuery();

                using var deletePedidosCommand = new NpgsqlCommand(
                    "DELETE FROM pedidos WHERE cliente_id = @id", 
                    connection, transaction);
                deletePedidosCommand.Parameters.AddWithValue("@id", id);
                deletePedidosCommand.ExecuteNonQuery();

                using var deleteClienteCommand = new NpgsqlCommand(
                    "DELETE FROM clientes WHERE id = @id", 
                    connection, transaction);
                deleteClienteCommand.Parameters.AddWithValue("@id", id);
                deleteClienteCommand.ExecuteNonQuery();

                transaction.Commit();
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        public List<cliente> Get()
        {
            using var connection = _dbConnection.GetConnection();
            using var command = new NpgsqlCommand("SELECT id, nome_cliente, datanascimento_cliente, email_cliente, senha FROM clientes", connection);
            using var reader = command.ExecuteReader();
            
            var clientes = new List<cliente>();
            while (reader.Read())
            {
                clientes.Add(new cliente
                {
                    id = reader.GetInt32(0),
                    nome_cliente = reader.GetString(1),
                    datanascimento_cliente = DateOnly.FromDateTime(reader.GetDateTime(2)),
                    email_cliente = reader.GetString(3),
                    senha = reader.GetString(4)
                });
            }
            return clientes;
        }

        public async Task<cliente?> GetByEmail(string email)
        {
            using var connection = await _dbConnection.GetConnectionAsync();
            using var command = new NpgsqlCommand("SELECT id, nome_cliente, datanascimento_cliente, email_cliente, senha FROM clientes WHERE email_cliente = @email", connection);
            command.Parameters.AddWithValue("@email", email);
            
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new cliente
                {
                    id = reader.GetInt32(0),
                    nome_cliente = reader.GetString(1),
                    datanascimento_cliente = DateOnly.FromDateTime(reader.GetDateTime(2)),
                    email_cliente = reader.GetString(3),
                    senha = reader.GetString(4)
                };
            }
            return null;
        }

        public async Task<bool> ValidarClienteLogin(string email_cliente, string senha)
        {
            var cliente = await GetByEmail(email_cliente);
            if (cliente == null) return false;
            
            return BCrypt.Net.BCrypt.Verify(senha, cliente.senha);
        }

        public async Task<cliente> AddclienteAsync(cliente cliente)
        {
            using var connection = await _dbConnection.GetConnectionAsync();
            using var command = new NpgsqlCommand(
                "INSERT INTO clientes (nome_cliente, datanascimento_cliente, email_cliente, senha) VALUES (@nome, @dataNascimento, @email, @senha) RETURNING id",
                connection);
            
            command.Parameters.AddWithValue("@nome", cliente.nome_cliente);
            command.Parameters.AddWithValue("@dataNascimento", cliente.datanascimento_cliente);
            command.Parameters.AddWithValue("@email", cliente.email_cliente);
            command.Parameters.AddWithValue("@senha", cliente.senha);
            
            cliente.id = (int)await command.ExecuteScalarAsync();
            return cliente;
        }

        public bool ClienteExists(int id)
        {
            using var connection = _dbConnection.GetConnection();
            using var command = new NpgsqlCommand("SELECT COUNT(1) FROM clientes WHERE id = @id", connection);
            command.Parameters.AddWithValue("@id", id);
            
            var count = (long)command.ExecuteScalar();
            return count > 0;
        }

        public bool ClienteHasPedidos(int id)
        {
            using var connection = _dbConnection.GetConnection();
            using var command = new NpgsqlCommand("SELECT COUNT(1) FROM pedidos WHERE cliente_id = @id", connection);
            command.Parameters.AddWithValue("@id", id);
            
            var count = (long)command.ExecuteScalar();
            return count > 0;
        }
    }
}
