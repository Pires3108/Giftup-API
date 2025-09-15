using APICRUD.DTO;
using APICRUD.Extensions;
using APICRUD.Infraestrutura;
using APICRUD.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
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
        [EnableCors("Production")]
        public IActionResult Add([FromBody] PedidoCreateDTO dto)
        {
            try
            {
                Console.WriteLine("=== INÍCIO Add Pedido ===");
                Console.WriteLine($"DTO recebido: {System.Text.Json.JsonSerializer.Serialize(dto)}");
                
                if (dto == null)
                {
                    Console.WriteLine("DTO é nulo");
                    return BadRequest("Dados do pedido são obrigatórios");
                }
                
                if (dto.itens == null || dto.itens.Count == 0)
                {
                    Console.WriteLine("Lista de itens é nula ou vazia");
                    return BadRequest("Lista de itens é obrigatória");
                }
                
                // Validar cada item
                foreach (var item in dto.itens)
                {
                    if (item.item_id <= 0)
                    {
                        Console.WriteLine($"Item ID inválido: {item.item_id}");
                        return BadRequest($"Item ID inválido: {item.item_id}");
                    }
                    if (item.quantidade <= 0)
                    {
                        Console.WriteLine($"Quantidade inválida: {item.quantidade}");
                        return BadRequest($"Quantidade inválida: {item.quantidade}");
                    }
                }
                
                var clienteId = User.GetClienteId();
                Console.WriteLine($"Cliente ID extraído do token: {clienteId}");
                
                if (clienteId <= 0)
                {
                    Console.WriteLine("Cliente ID inválido");
                    return BadRequest("Cliente ID inválido");
                }
                
                var pedido = new pedido
                {
                    cliente_id = clienteId,
                    status_pedido = 1,
                    PedidoItens = dto.itens.Select(i => new pedidoItem
                    {
                        item_id = i.item_id,
                        quantidade = i.quantidade
                    }).ToList()
                };

                Console.WriteLine($"Pedido criado com {pedido.PedidoItens.Count} itens");
                _pedidoRepository.AddPedido(pedido);
                Console.WriteLine("Pedido adicionado com sucesso");
                Console.WriteLine("=== FIM Add Pedido ===");
                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro em Add pedido: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return BadRequest($"Erro: {ex.Message}");
            }
        }

        [HttpGet]
        [EnableCors("Production")]
        public IActionResult Get()
        {
            var pedidos = _pedidoRepository.Get();
            return Ok(pedidos);
        }

        [Authorize]
        [HttpGet("Cliente")]
        [EnableCors("Production")]
        public IActionResult GetMeusPedidos()
        {
            try
            {
                Console.WriteLine("=== INÍCIO GetMeusPedidos ===");
                var clienteId = User.GetClienteId();
                Console.WriteLine($"Cliente ID extraído do token: {clienteId}");
                
                if (clienteId <= 0)
                {
                    Console.WriteLine("Cliente ID inválido");
                    return BadRequest("Cliente ID inválido");
                }
                
                var pedidos = _pedidoRepository.GetByClienteId(clienteId);
                Console.WriteLine($"Pedidos encontrados: {pedidos.Count}");
                Console.WriteLine("=== FIM GetMeusPedidos ===");
                return Ok(pedidos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro em GetMeusPedidos: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }

        [Authorize]
        [HttpPut("Cliente")]
        [EnableCors("Production")]
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
        [EnableCors("Production")]
        public IActionResult Delete(int pedidoId)
        {
            var clienteId = User.GetClienteId();

            try
            {
                _pedidoRepository.DeletePedido(clienteId, pedidoId);
                return Ok("Pedido excluído com sucesso.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

    }


}

