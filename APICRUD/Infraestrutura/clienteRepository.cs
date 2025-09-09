using APICRUD.Model;
using Microsoft.EntityFrameworkCore;

namespace APICRUD.Infraestrutura
{
    public class clienteRepository : IclienteRepository
    {
        private readonly ConnectionContext _context;

        public clienteRepository(ConnectionContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public void AddCliente(cliente cliente)
        {
            cliente.senha = BCrypt.Net.BCrypt.HashPassword(cliente.senha);

            _context.clientes.Add(cliente);
            _context.SaveChanges();
        }

        public void UpdateCliente(cliente cliente)
        {
            var existingCliente = _context.clientes.Find(cliente.id);
            if (existingCliente == null) return;

            existingCliente.nome_cliente = cliente.nome_cliente;
            existingCliente.datanascimento_cliente = cliente.datanascimento_cliente;
            existingCliente.email_cliente = cliente.email_cliente;
            
            if (!string.IsNullOrWhiteSpace(cliente.senha))
            {
                existingCliente.senha = cliente.senha;
            }

            _context.SaveChanges();
        }

        public void DeleteCliente(int id)
        {
            var cliente = _context.clientes.Find(id);
            if (cliente != null)
            {
                _context.clientes.Remove(cliente);
                _context.SaveChanges();
            }
        }

        public List<cliente> Get()
        {
            return _context.clientes.ToList();
        }

        public async Task<cliente?> GetByEmail(string email)
        {
            return await _context.clientes
                .FirstOrDefaultAsync(c => c.email_cliente == email);
        }

        public async Task<bool> ValidarClienteLogin(string email_cliente, string senha)
        {
            var cliente = await _context.clientes
                .FirstOrDefaultAsync(c => c.email_cliente == email_cliente);
            
            if (cliente == null) return false;
            
            return BCrypt.Net.BCrypt.Verify(senha, cliente.senha);
        }

        public async Task<cliente> AddclienteAsync(cliente cliente)
        {
            cliente.senha = BCrypt.Net.BCrypt.HashPassword(cliente.senha);

            _context.clientes.Add(cliente);
            await _context.SaveChangesAsync();
            return cliente;
        }
    }
}
