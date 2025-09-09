using APICRUD.DTO;
using APICRUD.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace APICRUD.Infraestrutura
{
    public class pedidoRepository : IpedidoRepository
    {
        private readonly ConnectionContext _context;

        public pedidoRepository(ConnectionContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public List<pedido> Get()
        {
            return _context.pedidos
                .Include(p => p.PedidoItens)
                .ThenInclude(pi => pi.itens)
                .Include(p => p.clientes)
                .ToList();
        }

        public List<PedidoDTO> GetByClienteId(int clienteId)
        {
            return _context.pedidos
                .Include(p => p.PedidoItens)
                    .ThenInclude(pi => pi.itens)
                .Where(p => p.cliente_id == clienteId)
                .Select(p => new PedidoDTO
                {
                    Id = p.id,
                    Items = p.PedidoItens.Select(pi => new PedidoItemResponseDTO
                    {
                        Nome = pi.itens != null ? pi.itens.nome_item : "Sem nome",
                        Preco = pi.itens != null ? pi.itens.preco_item : 0m,
                        Quantidade = pi.quantidade,
                        ItemId = pi.itemid
                    }).ToList(),
                    Total = p.PedidoItens.Sum(pi => (pi.itens != null ? pi.itens.preco_item : 0m) * pi.quantidade)
                })
                .ToList();
        }

        public void AddPedido(pedido pedido)
        {
            using (var transaction = _context.Database.BeginTransaction())
            {
                try
                {
                    var pedidoParaSalvar = new pedido
                    {
                        cliente_id = pedido.cliente_id,
                        status_pedido = pedido.status_pedido
                    };
                    
                    _context.pedidos.Add(pedidoParaSalvar);
                    _context.SaveChanges();
                    
                    Console.WriteLine($"Pedido salvo com ID: {pedidoParaSalvar.id}");
                    
                    foreach (var item in pedido.PedidoItens)
                    {
                        var pedidoItem = new pedidoItem
                        {
                            pedidoid = pedidoParaSalvar.id,
                            itemid = item.itemid,
                            quantidade = item.quantidade
                        };
                        _context.pedidoitens.Add(pedidoItem);
                        Console.WriteLine($"Adicionando item: pedidoid={pedidoItem.pedidoid}, itemid={pedidoItem.itemid}, quantidade={pedidoItem.quantidade}");
                    }
                    
                    _context.SaveChanges();
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
        }

        public void DeletePedido(int clienteId, int pedidoId)
        {
            var pedido = _context.pedidos
                .Include(p => p.PedidoItens) // incluir itens
                .FirstOrDefault(p => p.id == pedidoId && p.cliente_id == clienteId);

            if (pedido == null)
                throw new Exception("Pedido n?o encontrado ou n?o pertence ao cliente.");

            _context.pedidoitens.RemoveRange(pedido.PedidoItens);
            _context.pedidos.Remove(pedido);

            _context.SaveChanges();
        }



        [HttpDelete("{pedidoId}")]
        public void DeletePedidoById(int pedidoId)
        {
            var pedido = _context.pedidos.FirstOrDefault(p => p.id == pedidoId);
            if (pedido == null)
                throw new Exception("Pedido n?o encontrado.");

            _context.pedidos.Remove(pedido);
            _context.SaveChanges();
        }



        public void UpdatePedido(int id, int cliente_id, List<PedidoitemDTO> itens)
        {
            var pedido = _context.pedidos.Include(p => p.PedidoItens).FirstOrDefault(p => p.id == id);
            if (pedido != null)
            {
                pedido.cliente_id = cliente_id;
                _context.pedidoitens.RemoveRange(pedido.PedidoItens);

                pedido.PedidoItens = itens.Select(i => new pedidoItem
                {
                    pedidoid = pedido.id,
                    itemid = i.item_id,
                    quantidade = i.quantidade
                }).ToList();

                _context.SaveChanges();
            }
        }
    }
}
