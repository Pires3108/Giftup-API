using System.Text.Json.Serialization;

namespace APICRUD.Model
{
    public class cliente
    {
        public int id { get; set; }
        public string nome_cliente { get; set; } = string.Empty;
        public DateOnly datanascimento_cliente { get; set; }
        public string email_cliente { get; set; } = string.Empty;
        public string senha { get; set; } = string.Empty;
        
        [JsonIgnore]
        public bool islogged { get; set; } = false;

        public cliente() { }

        public cliente(string nome_cliente, DateOnly dataNascimento_cliente, string email_cliente, 
            string senha)
        {
            this.nome_cliente = nome_cliente;
            this.datanascimento_cliente = dataNascimento_cliente;
            this.email_cliente = email_cliente;
            this.senha = senha;
        }


    }
}
