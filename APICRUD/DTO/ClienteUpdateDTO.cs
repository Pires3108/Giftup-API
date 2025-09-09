namespace APICRUD.DTO
{
    public class ClienteUpdateDTO
    {
        public string nome_cliente { get; set; }
        public DateOnly datanascimento_cliente { get; set; }
        public string email_cliente { get; set; }
        public string senha { get; set; }
        public bool islogged { get; set; }
    }
}
