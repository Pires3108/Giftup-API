using APICRUD.Model;

namespace APICRUD.Infraestrutura
{
    public class pedidoItemRepository : IpedidoItemRepository
    {
        private readonly ConnectionContext _context;

        public pedidoItemRepository(ConnectionContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }
        public void AddPedidoItem(pedidoItem pedidoItem)
        {
            _context.pedidoitens.Add(pedidoItem);
            _context.SaveChanges();
        }

        public List<pedidoItem> Get()
        {
            return _context.pedidoitens.ToList();
        }
    }
}

