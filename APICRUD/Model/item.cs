namespace APICRUD.Model
{
    public class item
    {
        public int id { get; set; }
        public string nome_item { get; set; } = string.Empty;
        public decimal preco_item { get; set; }
        public string foto_item { get; set; } = string.Empty;

        public item() { }

        public item(string nome_item, decimal preco_item, string foto_item)
        {
            this.nome_item = nome_item;
            this.preco_item = preco_item;
            this.foto_item = foto_item;
        }

    }
}
