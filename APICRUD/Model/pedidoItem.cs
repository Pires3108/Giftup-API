using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore.SqlServer.Query.Internal;

namespace APICRUD.Model
{
    [Table("pedidoitens")]
    public class pedidoItem
    {
        [Key]
        public int id { get; set; }
        public int pedidoid { get; set; }
        public int itemid { get; set; }
        public int quantidade { get; set; }

        [ForeignKey("pedidoid")]
        [JsonIgnore]
        public pedido pedidos { get; set; }
        
        [ForeignKey("itemid")]
        [JsonIgnore]
        public item itens { get; set; }
       
        public pedidoItem() { }

        public pedidoItem(int quantidade)
        {
            this.quantidade = quantidade;
        }
    }
}
