const obj = {
    message: 'a',
    status: 'b'
}

const props = Object.getOwnPropertyNames(obj)

console.log(props)

const result = "messa1ge" in obj
console.log(result)