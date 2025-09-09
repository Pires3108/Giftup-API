using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace APICRUD.Model
{
    [Table("pedidos")]
    public class pedido
    {
        [Key]
        public int id { get; set; }

        public int cliente_id { get; set; }

        public int status_pedido { get; set; }
        [NotMapped]
        public decimal total { get; set; }

        [ForeignKey("cliente_id")]
        [JsonIgnore]
        public cliente clientes { get; set; }

        public pedido() { }

        public pedido(int cliente_id, int status_pedido, decimal total )
        {
            this.cliente_id = cliente_id;
            this.status_pedido = status_pedido;
            this.total = total;
        }

        public List<pedidoItem> PedidoItens { get; set; } = new();

    }
}
