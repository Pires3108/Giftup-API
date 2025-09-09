using APICRUD.Model;
using APICRUD.DTO;

public interface IpedidoRepository
{
    void AddPedido(pedido pedido);
    void UpdatePedido(int id, int cliente_id, List<PedidoitemDTO> itens);
    public void DeletePedido(int clienteId, int pedidoId);
    List<pedido> Get();
    public List<PedidoDTO> GetByClienteId(int clienteId);
}
