using APICRUD.Model;
using APICRUD.ViewModel;
using Microsoft.AspNetCore.Mvc;
using APICRUD.Extensions;

namespace APICRUD.Controllers
{
    [ApiController]
    [Route("api/v1/item")]
    public class ItemController : ControllerBase
    {
        private readonly IitemRepository _itemRepository;
        public ItemController(IitemRepository itemRepository)
        {
            _itemRepository = itemRepository ?? throw new ArgumentNullException(nameof(itemRepository));
        }

        [HttpPost]
        public IActionResult Add([FromForm] itemViewModel itemViewModel)
        {
            var fotoPath = Path.Combine("Storage", itemViewModel.foto_item.FileName);

            using Stream fileStream = new FileStream(fotoPath, FileMode.Create);
            itemViewModel.foto_item.CopyTo(fileStream);

            var newItem = new item(itemViewModel.nome_item,
                itemViewModel.preco_item, fotoPath);

            _itemRepository.AddItem(newItem);
            return Ok();
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromForm] itemViewModel itemViewModel)
        {
            var itemExistente = _itemRepository.GetItem(id);
            if (itemExistente == null)
            {
                return NotFound("Item não encontrado.");
            }


            if (itemViewModel.foto_item != null)
            {
                var fotoPath = Path.Combine("Storage", itemViewModel.foto_item.FileName);

                using Stream fileStream = new FileStream(fotoPath, FileMode.Create);
                itemViewModel.foto_item.CopyTo(fileStream);

                itemExistente.foto_item = fotoPath;

                itemExistente.nome_item = itemViewModel.nome_item;
                itemExistente.preco_item = itemViewModel.preco_item;

                _itemRepository.UpdateItem(itemExistente);

                return Ok(itemExistente);
            }
            return BadRequest("Foto do item é obrigatória para atualização.");
        }
        

        [HttpGet]
        [Route("{id}/download")]
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
        public IActionResult Get()
        {
            var itens = _itemRepository.Get();
            return Ok(itens);
        }

        [HttpDelete("{id}")]
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
