using System.Text.Json.Serialization;

namespace APICRUD.ViewModel
{
    public class clienteViewModel
    {
        public string nome_cliente { get; set; }
        public DateOnly datanascimento_cliente { get; set; }
        public string email_cliente { get; set; }
        public string senha { get; set; }
        
        [JsonIgnore]
        public bool islogged { get; set; } = false;
    }
}
