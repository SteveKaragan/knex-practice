const knex = require('knex')

const knexInstance = knex({
  client: 'pg',
  connection: 'postgresql://dunder_mifflin@localhost/knex-practice'
})

//DRILL 1

  function searchByName(searchTerm) {
    knexInstance
      .select('product_id', 'name', 'price', 'date_added', 'checked', 'category')
      .from('shopping_list')
      .where('name', 'ILIKE', `%${searchTerm}%`)
      .then(result => {
        console.log(result)
      })
  }
  
  searchByName('fish')

//DRILL 2
    function paginateList(page) {
    const productsPerPage = 6
    const offset = productsPerPage * (page - 1)
    knexInstance
      .select('product_id', 'name', 'price', 'date_added', 'checked', 'category')
      .from('shopping_list')
      .limit(productsPerPage)
      .offset(offset)
      .then(result => {
        console.log(result)
      })
  }
  
  paginateList(2)

//DRILL 3
  function addedToListBefore(days) {
    knexInstance
      .select('product_id', 'name', 'price', 'date_added', 'checked', 'category')
      .from('shopping_list')
      .where(
            'date_added',
            '<',
            knexInstance.raw(`now() - '?? days'::INTERVAL`, days))
      .then(result => {
        console.log(result)
      })
  }
  
  addedToListBefore(10)

//DRILL 4
function categoryCost(days) {
    knexInstance
      .select('category')
      .sum('price AS total')
      .from('shopping_list')
      .groupBy('category')
      .orderBy([
        { column: 'category', order: 'ASC' },
        { column: 'total', order: 'DESC' }
      ])
      .then(result => {
        console.log(result)
      })
  }
  
  categoryCost()