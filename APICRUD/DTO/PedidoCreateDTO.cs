namespace APICRUD.DTO
{
    public class PedidoCreateDTO
    {
        public int cliente_id { get; set; }
        public List<PedidoitemDTO> itens { get; set; }
    }
}
