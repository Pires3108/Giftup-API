using APICRUD.DTO;
using APICRUD.Extensions;
using APICRUD.Model;
using APICRUD.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
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
        [EnableCors("Production")]
        public async Task<IActionResult> Add([FromBody] clienteViewModel clientesView)
        {
            try
            {
                var existing = await _clientesRepository.GetByEmail(clientesView.email_cliente);
                if (existing != null)
                {
                    return Conflict(new { mensagem = "email_cliente já cadastrado" });
                }

                var hashedPassword = BCrypt.Net.BCrypt.HashPassword(clientesView.senha);
                Console.WriteLine($"=== REGISTRATION DEBUG ===");
                Console.WriteLine($"email_cliente: {clientesView.email_cliente}");
                Console.WriteLine($"senha original: {clientesView.senha}");
                Console.WriteLine($"senha hasheada: {hashedPassword}");
                Console.WriteLine($"Tamanho do hash: {hashedPassword?.Length ?? 0}");
                
                var cliente = new cliente(
                    clientesView.nome_cliente,
                    clientesView.datanascimento_cliente,
                    clientesView.email_cliente,
                    hashedPassword);
                
                Console.WriteLine($"Cliente criado com senha: {cliente.senha}");
                Console.WriteLine($"Tamanho da senha no cliente: {cliente.senha?.Length ?? 0}");

                await _clientesRepository.AddclienteAsync(cliente);
                return Ok();
            }
            catch (Npgsql.PostgresException ex) when (ex.SqlState == "23505")
            {
                // 23505: unique_violation
                return Conflict(new { mensagem = "email_cliente já cadastrado" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = "Erro ao cadastrar cliente", erro = ex.Message });
            }
        }


        [HttpGet]
        [EnableCors("Production")]
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
        [EnableCors("Production")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {
                Console.WriteLine($"=== LOGIN DEBUG ===");
                Console.WriteLine($"email_cliente recebido: '{dto.email_cliente}'");
                Console.WriteLine($"senha recebida: '{dto.senha}'");
                
                var cliente = await _clientesRepository.GetByEmail(dto.email_cliente);
                if (cliente == null)
                {
                    Console.WriteLine($"Cliente não encontrado para email: {dto.email_cliente}");
                    return Unauthorized(new { mensagem = "Credenciais invalidas" });
                }

                Console.WriteLine($"Cliente encontrado: {cliente.nome_cliente}");
                Console.WriteLine($"email_cliente do cliente: '{cliente.email_cliente}'");
                Console.WriteLine($"Hash da senha no banco: {cliente.senha}");
                Console.WriteLine($"Tamanho do hash: {cliente.senha?.Length ?? 0}");
                Console.WriteLine($"senha fornecida: '{dto.senha}'");
                Console.WriteLine($"Tamanho da senha fornecida: {dto.senha?.Length ?? 0}");

                // Teste de verificação de senha
                var testHash = BCrypt.Net.BCrypt.HashPassword(dto.senha);
                Console.WriteLine($"Hash de teste gerado: {testHash}");
                var testVerify = BCrypt.Net.BCrypt.Verify(dto.senha, testHash);
                Console.WriteLine($"Teste de verificação com hash novo: {testVerify}");

                var senhaValida = BCrypt.Net.BCrypt.Verify(dto.senha, cliente.senha);
                Console.WriteLine($"Verificação da senha real: {senhaValida}");
                
                if (!senhaValida)
                {
                    Console.WriteLine("Verificação de senha falhou");
                    return Unauthorized(new { mensagem = "Credenciais invalidas" });
                }

                var token = _tokenService.GenerateToken(cliente);
                Console.WriteLine("Login bem-sucedido!");

                return Ok(new
                {
                    mensagem = "Login bem-sucedido",
                    token,
                    cliente = new { id = cliente.id, nome = cliente.nome_cliente, email = cliente.email_cliente }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro no login: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { mensagem = "Erro interno do servidor", erro = ex.Message });
            }
        }
    }
}