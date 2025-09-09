namespace APICRUD.DTO
{
    public class PedidoUpdateDTO
    {
        public int cliente_id { get; set; }
        public List<PedidoitemDTO> itens { get; set; }
    }
}
