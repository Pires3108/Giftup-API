using System.Text.Json.Serialization;

namespace APICRUD.Model
{
    public class pedido
    {
        public int id { get; set; }
        public int cliente_id { get; set; }
        public int status_pedido { get; set; }
        public decimal total { get; set; }

        [JsonIgnore]
        public cliente? clientes { get; set; }

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
