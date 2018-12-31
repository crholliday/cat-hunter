const { Model } = require('./entities/models')

async function getIds() {
  let arr = await Model.getAll()
  const newArr = arr.map(mod => mod._id)
  console.log(newArr)
}

getIds()
