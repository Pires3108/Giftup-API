namespace APICRUD.ViewModel
{
    public class itemViewModel
    {
        public string nome_item { get; set; }
        public string preco_item { get; set; }
        public IFormFile? foto_item { get; set; }
        public string descricao_item { get; set; }
    }
}
