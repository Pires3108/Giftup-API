using APICRUD.Model;

namespace APICRUD.Infraestrutura
{
    public class itemRepository : IitemRepository
    {
        private readonly ConnectionContext _context;

        public itemRepository(ConnectionContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }
        public List<item> Get()
        {
            return _context.itens.ToList();
        }
        public void AddItem(item item)
        {
            _context.itens.Add(item);
            _context.SaveChanges();
        }
        public void DeleteItem(item item) 
        {
            _context.itens.Remove(item);
            _context.SaveChanges();
        }
        public void UpdateItem(item item)
        {
            _context.itens.Update(item);
            _context.SaveChanges();
        }
        public item? GetItem(int id)
        {
            return _context.itens.Find(id);
        }
    }
}
