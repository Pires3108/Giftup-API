namespace APICRUD.Model
{
    public interface IitemRepository
    {
        void AddItem(item item);
        void UpdateItem(item item);
        void DeleteItem(item item);
        List<item> Get();
        item? GetItem(int id);
    }
}
