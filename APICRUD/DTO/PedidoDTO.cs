using System.Text.Json.Serialization;

public class PedidoDTO
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("items")]
    public List<PedidoItemResponseDTO> Items { get; set; } = new List<PedidoItemResponseDTO>();

    [JsonPropertyName("total")]
    public decimal Total { get; set; }
}