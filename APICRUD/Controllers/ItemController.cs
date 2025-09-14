using APICRUD.Model;
using APICRUD.ViewModel;
using Microsoft.AspNetCore.Mvc;
using APICRUD.Extensions;
using Microsoft.AspNetCore.Cors;

namespace APICRUD.Controllers
{
    [ApiController]
    [Route("api/v1/item")]
    [EnableCors("AllowFrontend")]
    public class ItemController : ControllerBase
    {
        private readonly IitemRepository _itemRepository;
        public ItemController(IitemRepository itemRepository)
        {
            _itemRepository = itemRepository ?? throw new ArgumentNullException(nameof(itemRepository));
        }

        [HttpPost]
        [EnableCors("AllowFrontend")]
        public IActionResult Add([FromForm] itemViewModel itemViewModel)
        {
            var fileName = $"{Guid.NewGuid()}_{itemViewModel.foto_item.FileName}";
            var fotoPath = Path.Combine("Storage", fileName);

            using Stream fileStream = new FileStream(fotoPath, FileMode.Create);
            itemViewModel.foto_item.CopyTo(fileStream);

            var preco = decimal.Parse(itemViewModel.preco_item, System.Globalization.CultureInfo.InvariantCulture);

            var newItem = new item(itemViewModel.nome_item, preco, fotoPath);

            _itemRepository.AddItem(newItem);
            return Ok();
        }

       [HttpPut("{id}")]
       [EnableCors("AllowFrontend")]
public IActionResult Update(int id, [FromForm] itemViewModel itemViewModel)
{
    var itemExistente = _itemRepository.GetItem(id);
    if (itemExistente == null)
    {
        return NotFound("Item não encontrado.");
    }

    itemExistente.nome_item = itemViewModel.nome_item;
    itemExistente.preco_item = decimal.Parse(itemViewModel.preco_item, System.Globalization.CultureInfo.InvariantCulture);

    if (itemViewModel.foto_item != null)
    {
        if (!string.IsNullOrEmpty(itemExistente.foto_item) && System.IO.File.Exists(itemExistente.foto_item))
        {
            try
            {
                System.IO.File.Delete(itemExistente.foto_item);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao deletar imagem antiga: {ex.Message}");
            }
        }

        var fileName = $"{Guid.NewGuid()}_{itemViewModel.foto_item.FileName}";
        var fotoPath = Path.Combine("Storage", fileName);

        using Stream fileStream = new FileStream(fotoPath, FileMode.Create);
        itemViewModel.foto_item.CopyTo(fileStream);

        itemExistente.foto_item = fotoPath;
    }

    _itemRepository.UpdateItem(itemExistente);
    return Ok(itemExistente);
}
        

        [HttpGet]
        [Route("{id}/download")]
        [EnableCors("AllowFrontend")]
        public IActionResult DownloadFoto(int id)
        {
            var item = _itemRepository.GetItem(id);
            if (item == null || string.IsNullOrEmpty(item.foto_item) || !System.IO.File.Exists(item.foto_item))
            {
                return NotFound("Item or file not found.");
            }
            var fileBytes = System.IO.File.ReadAllBytes(item.foto_item);

            return File(fileBytes, "image/png");
        }


        [HttpGet]
        [EnableCors("AllowFrontend")]
        public IActionResult Get()
        {
            var itens = _itemRepository.Get();
            return Ok(itens);
        }

        [HttpDelete("{id}")]
        [EnableCors("AllowFrontend")]
        public IActionResult Delete(int id)
        {
            var itemToDelete = new item
            {
                id = id
            };
            _itemRepository.DeleteItem(itemToDelete);
            return Ok();
        }
    }
}
