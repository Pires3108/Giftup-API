namespace APICRUD.Model
{
    public interface IclienteRepository
    {
        void AddCliente(cliente cliente);
        void UpdateCliente(cliente cliente);
        void DeleteCliente(int id);
        List<cliente> Get();
        Task<bool> ValidarClienteLogin(string email_cliente, string senha);
        Task<cliente> AddclienteAsync(cliente cliente);
        Task<cliente?> GetByEmail(string email);
        bool ClienteExists(int id);
        bool ClienteHasPedidos(int id);
    }
}
