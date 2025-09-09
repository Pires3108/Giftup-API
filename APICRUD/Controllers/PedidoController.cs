using APICRUD.DTO;
using APICRUD.Extensions;
using APICRUD.Infraestrutura;
using APICRUD.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace APICRUD.Controllers
{
    [ApiController]
    [Route("api/v1/pedido")]
    public class PedidoController : ControllerBase
    {
        private readonly IpedidoRepository _pedidoRepository;

        public PedidoController(IpedidoRepository pedidoRepository)
        {
            _pedidoRepository = pedidoRepository ?? throw new ArgumentNullException(nameof(pedidoRepository));
        }

        [Authorize]
        [HttpPost]
        public IActionResult Add([FromBody] PedidoCreateDTO dto)
        {
            try
            {
                var pedido = new pedido
                {
                    cliente_id = User.GetClienteId(),
                    status_pedido = 1,
                    PedidoItens = dto.itens.Select(i => new pedidoItem
                    {
                        itemid = i.item_id,
                        quantidade = i.quantidade
                    }).ToList()
                };

                _pedidoRepository.AddPedido(pedido);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest($"Erro: {ex.Message}");
            }
        }

        [HttpGet]
        public IActionResult Get()
        {
            var pedidos = _pedidoRepository.Get();
            return Ok(pedidos);
        }

        [Authorize]
        [HttpGet("Cliente")]
        public IActionResult GetMeusPedidos()
        {
            var clienteId = User.GetClienteId();
            var pedidos = _pedidoRepository.GetByClienteId(clienteId);
            return Ok(pedidos);
        }

        [Authorize]
        [HttpPut("Cliente")]
        public IActionResult Update(PedidoUpdateDTO dto)
        {
            var clienteId = User.GetClienteId();
            var pedido = _pedidoRepository.GetByClienteId(clienteId).FirstOrDefault();
            if (pedido == null)
                return NotFound("Pedido não encontrado para este cliente");
            
            _pedidoRepository.UpdatePedido(pedido.Id, clienteId, dto.itens);
            return Ok();
        }


        [Authorize]
        [HttpDelete("{pedidoId}")]
        public IActionResult Delete(int pedidoId)
        {
            var clienteId = User.GetClienteId();

            try
            {
                _pedidoRepository.DeletePedido(clienteId, pedidoId);
                return Ok("Pedido exclu�do com sucesso.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

    }


}

