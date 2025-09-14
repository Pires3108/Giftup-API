using APICRUD.DTO;
using APICRUD.Extensions;
using APICRUD.Model;
using APICRUD.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace APICRUD.Controllers
{
    [ApiController]
    [Route("api/v1/cliente")]
    public class ClienteController : ControllerBase
    {
        private readonly IclienteRepository _clientesRepository;
        private readonly TokenService _tokenService;
        public ClienteController(IclienteRepository clientesRepository, TokenService tokenService)
        {
            _clientesRepository = clientesRepository ?? throw new ArgumentNullException(nameof(clientesRepository));
            _tokenService = tokenService;
        }


        [HttpPost]
        public async Task<IActionResult> Add([FromBody] clienteViewModel clientesView)
        {
            try
            {
                var existing = await _clientesRepository.GetByEmail(clientesView.email_cliente);
                if (existing != null)
                {
                    return Conflict(new { mensagem = "Email já cadastrado" });
                }

                var cliente = new cliente(
                    clientesView.nome_cliente,
                    clientesView.datanascimento_cliente,
                    clientesView.email_cliente,
                    clientesView.senha);

                await _clientesRepository.AddclienteAsync(cliente);
                return Ok();
            }
            catch (Npgsql.PostgresException ex) when (ex.SqlState == "23505")
            {
                // 23505: unique_violation
                return Conflict(new { mensagem = "Email já cadastrado" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao cadastrar cliente", erro = ex.Message });
            }
        }


        [HttpGet]
        public IActionResult Get()
        {
            var clientes = _clientesRepository.Get();
            return Ok(clientes);
        }

        [Authorize]
        [HttpPut("unico")]
        public IActionResult Update(ClienteUpdateDTO dto)
        {
            var clienteId = User.GetClienteId();
            var existingCliente = new cliente
            {
                id = clienteId,
                nome_cliente = dto.nome_cliente,
                datanascimento_cliente = dto.datanascimento_cliente,
                email_cliente = dto.email_cliente,
                senha = string.IsNullOrWhiteSpace(dto.senha)
                    ? "" 
                    : BCrypt.Net.BCrypt.HashPassword(dto.senha)
            };
            _clientesRepository.UpdateCliente(existingCliente);
            return Ok();
        }

        [Authorize]
        [HttpDelete("Cliente")]
        public IActionResult Delete()
        {
            var clienteId = User.GetClienteId();
            _clientesRepository.DeleteCliente(clienteId);
            return Ok();
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteById(int id)
        {
            try
            {
                if (!_clientesRepository.ClienteExists(id))
                {
                    return NotFound(new { mensagem = "Cliente não encontrado" });
                }

                var hasPedidos = _clientesRepository.ClienteHasPedidos(id);
                
                _clientesRepository.DeleteCliente(id);
                
                var response = new { 
                    mensagem = "Cliente deletado com sucesso",
                    cliente_id = id,
                    pedidos_relacionados_deletados = hasPedidos
                };
                
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    mensagem = "Erro interno do servidor", 
                    erro = ex.Message,
                    detalhes = "Verifique se há restrições de integridade no banco de dados"
                });
            }
        }

        [Authorize]
        [HttpGet("Cliente")]
        public IActionResult GetById()
        {
            var clienteId = User.GetClienteId();
            var cliente = _clientesRepository.Get().FirstOrDefault(c => c.id == clienteId);
            if (cliente == null) return NotFound();
            var dto = new ClienteUpdateDTO
            {
                nome_cliente = cliente.nome_cliente,
                datanascimento_cliente =
                cliente.datanascimento_cliente,
                email_cliente = cliente.email_cliente,
                senha = ""
            };
            return Ok(dto);
        }
        

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var cliente = await _clientesRepository.GetByEmail(dto.Email);
            if (cliente == null)
                return Unauthorized(new { mensagem = "Credenciais invalidas" });

            var senhaValida = BCrypt.Net.BCrypt.Verify(dto.Senha, cliente.senha);
            if (!senhaValida)
                return Unauthorized(new { mensagem = "Credenciais invalidas" });

            var token = _tokenService.GenerateToken(cliente);

            return Ok(new
            {
                mensagem = "Login bem-sucedido",
                token,
                cliente = new { id = cliente.id, nome = cliente.nome_cliente, email = cliente.email_cliente }
            });
        }
    }
}