using System.Text.Json.Serialization;

public class PedidoItemResponseDTO
{
    [JsonPropertyName("nome")]
    public string Nome { get; set; }

    [JsonPropertyName("preco")]
    public decimal Preco { get; set; }

    [JsonPropertyName("quantidade")]
    public int Quantidade { get; set; }

    [JsonPropertyName("item_id")]
    public int ItemId { get; set; }
}