import * as jwt from 'jsonwebtoken'

function printMockTocken() {
    console.log(jwt.sign({id: 'pruebita'}, 'test', { expiresIn: undefined + ' days' }))
}

printMockTocken()