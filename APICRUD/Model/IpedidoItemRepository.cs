namespace APICRUD.Model
{
    public interface IpedidoItemRepository
    {
        void AddPedidoItem(pedidoItem pedidoItem) { }
        List<pedidoItem> Get();
    }
}
