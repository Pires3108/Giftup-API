using System.Text.Json.Serialization;

namespace APICRUD.Model
{
    public class pedidoItem
    {
        public int id { get; set; }
        public int pedidoid { get; set; }
        public int itemid { get; set; }
        public int quantidade { get; set; }

        [JsonIgnore]
        public pedido? pedidos { get; set; }
        
        [JsonIgnore]
        public item? itens { get; set; }
       
        public pedidoItem() { }

        public pedidoItem(int quantidade)
        {
            this.quantidade = quantidade;
        }
    }
}
