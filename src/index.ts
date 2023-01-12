import express, {Response, Request} from 'express'
import cors from 'cors'
import { userAccounts } from './data'

const app = express()
app.use(express.json())
app.use(cors())

// Teste
app.get("/teste", (req: Request, res: Response) => {
    res.status(400).send('Teste')
})

// Get All Users
app.get("/users", (req: Request, res: Response)=>{

    let errorCode= 400

    try{
        res.status(200).send(userAccounts)
    }catch(e: any){
        res.status(errorCode).send(e.message)
    }
})


// Create Bank Account 
app.post("/users", (req: Request, res: Response) => {
    const {name, cpf, dateOfBirth} = req.body
    let errorCode = 400

    try {

        if (!name) {
            errorCode = 422
            throw new Error("Informe o seu nome completo.");
        }

        if (!cpf) {
            errorCode = 422
            throw new Error("Informe o seu CPF.");
        }

        if (!dateOfBirth) {
            errorCode = 422
            throw new Error("Informe a sua data de nascimento no padrão DD/MM/AAAA.");
        }

        userAccounts.forEach((user) => {
            if (user.cpf === cpf) {
                errorCode = 409
                throw new Error("CPF já existente no banco de dados.");  
            }
        })

        const birthDateArray = dateOfBirth.split("/").map(Number)
        let minimumBirthDate = new Date(birthDateArray[2] + 18, birthDateArray[1] - 1, birthDateArray[0])
        let today = new Date()
        if (minimumBirthDate > today) {
            errorCode = 403
            throw new Error("Idade mínima de 18 anos não alcançada.");
        }

        const newUser = {
            id: Date.now().toString(),
            name,
            cpf,
            dateOfBirth,
            balance: 0,
            statement: []
        }

        userAccounts.push(newUser)

        res.status(201).send(newUser)
        
    } catch (err:any) {
        res.status(errorCode).send(err.message)
    }
})


// Delete bank account
app.delete('/users/:id', (req: Request, res: Response) => {
    const accountId = req.params.id
    let error = 400
    
    try {
        if(accountId === ':id') {
            error = 422
            throw new Error('É necessário adicionar o id da conta bancária que deseja deletar.')
        }

        const idExists = userAccounts.filter(item => item.id === accountId)
        if(idExists.length === 0) {
            error = 404
            throw new Error('O id da conta bancária não existe.')
        }

        const accountsNotDeleted = userAccounts.filter(item => item.id !== accountId)
        res.status(201).send(accountsNotDeleted)

    } catch (err: any) {
        res.status(error).send(err.message)
    }
})


// Make a payment
app.post("/users/payment", (req: Request, res: Response) => {
    const userCpf = req.headers.cpf as string
    const {value, date, description} = req.body
    let errorCode = 400

    try {
        
        if (!userCpf) {
            errorCode = 403
            throw new Error("Informe seu CPF para continuar.");
        }

        const getUser = userAccounts.find(user => user.cpf === userCpf)

        if (!getUser) {
            errorCode = 401
            throw new Error("Usuário não encontrado no banco de dados.");
        }

        if (value === 0) {
            errorCode = 422
            throw new Error("O valor da conta não pode ser nulo.");
        }

        if (value > getUser.balance) {
            errorCode = 401
            throw new Error("Saldo insuficiente.");
        }

        if (!description) {
            errorCode = 422
            throw new Error("Adicione uma descrição para esta transação.");
        }

        let paymentDate: string

        const today = new Date()

        if (!date) {
            const day = today.getDate();
            const month = (today.getMonth() > 9 ? `${today.getMonth() + 1}` : `0${today.getMonth() + 1}`);
            const year = today.getFullYear();
            paymentDate = `${day}/${month}/${year}`
        } else {
            paymentDate = date
        }

        const informedDateArray = date.split("/").map(Number)
        let hours = today.getHours()
        let minutes = today.getMinutes()
        let seconds = today.getSeconds()
        let informedDate = new Date(informedDateArray[2], informedDateArray[1] - 1, informedDateArray[0], hours + 3, minutes, seconds)

        if (informedDate < today) {
            errorCode = 404
            throw new Error("Não é possível realizar pagamentos em uma data anterior ao dia de hoje.");
        }

        const payment = {
            value,
            date: paymentDate,
            description
        }

        getUser.statement.push(payment)

        res.status(201).send(getUser)

    } catch (err:any) {
        res.status(errorCode).send(err.message)
    }
})

// Update Balance

app.put("/users/balance", (req: Request, res: Response) => {
    const cpf = req.headers.cpf as string
    let errorCode = 400
    const today = new Date()

    try {
        if (!cpf) {
            errorCode = 403
            throw new Error("Informe seu CPF para continuar.");
        }

        const getUser = userAccounts.find(user => user.cpf === cpf)

        if (!getUser) {
            errorCode = 401
            throw new Error("Usuário não encontrado no banco de dados.");
        }

        for (let i = 0; i < getUser.statement.length; i++) {
            let timestampArray = getUser.statement[i].date.split("/").map(Number)
            let timestamp = new Date(timestampArray[2], timestampArray[1] - 1, timestampArray[0])

            if (timestamp < today) {
                getUser.balance -= getUser.statement[i].value
            }

            getUser.balance = Number(getUser.balance.toFixed(2))
        }

        res.status(200).send(`Saldo atualizado: R$ ${getUser.balance}`)

    } catch (err:any) {
        res.status(errorCode).send(err.message)
    }

})

// Get Account Balance
app.get("/users/balance",(req: Request, res: Response)=>{

    const name = req.headers.name as string
    const cpf = req.headers.cpf as string
    let errorCode= 400
    let userBalance
    
    try{

        if(!name && !cpf){
            errorCode= 422
            throw new Error("É obrigatório informar o nome completo e o CPF para consultar seu saldo.")
        }
        
        if(!name){
            errorCode= 422
            throw new Error("Informe o seu nome completo.")            
        }
        
        if(!cpf){
            errorCode= 422
            throw new Error("Informe o seu CPF.")            
        } 
        
        const userExisting = userAccounts.filter((user)=>{
            if(user.name.toLowerCase() === name.toLowerCase() && user.cpf === cpf){
                return user
            }
        })

        if(userExisting.length === 0){
            errorCode= 422
            throw new Error("Usuário não encontrado.")            
        }

        for(let user of userAccounts){
            if(user.name.toLowerCase() === name.toLowerCase() && user.cpf === cpf){
               userBalance = user.balance
            }
        }
        
        res.status(200).send(`${userBalance}`)        

    }catch(e: any){
        res.status(errorCode).send(e.message)
    }
})


// Add Balance
app.put("/users/add/balance",(req: Request, res: Response)=>{

    const name = req.headers.name as string
    const cpf = req.headers.cpf as string
    const valueToAdd = Number(req.body.valueToAdd)
    let userBalance
    let userAdd 
    let errorCode= 400

    try{

        if(!name && !cpf && !valueToAdd){
            errorCode= 422
            throw new Error("É obrigatório informar o nome completo, o CPF e o valor que você deseja adicionar.")
        }        
        
        if(!name){
            errorCode= 422
            throw new Error("Informe o seu nome completo.")            
        }
        
        if(!cpf){
            errorCode= 422
            throw new Error("Informe o seu CPF.")            
        }

        if(!valueToAdd){
            errorCode= 422
            throw new Error("Informe o valor que você deseja adicionar.")
        }

        const userExisting = userAccounts.filter((user)=>{
            if(user.name.toLowerCase() === name.toLowerCase() && user.cpf === cpf){
                return user
            }
        })

        if(userExisting.length === 0){
            errorCode= 422
            throw new Error("Usuário não encontrado.")            
        }

        for(let user of userAccounts){
            if(user.name.toLowerCase() === name.toLowerCase() && user.cpf === cpf){
               user.balance = user.balance + valueToAdd
               userBalance = user.balance
               user.statement.push({
                value: valueToAdd, 
                date: new Date().toString(), 
                description: 'Depósito de dinheiro'
               })
               userAdd = user.statement[user.statement.length -1]
            }
        }

        res.status(200).send(`${userAdd?.date}
        O saldo foi adicionado com sucesso! Seu novo saldo é: ${userBalance}.`) 

    }catch(e: any){
        res.status(errorCode).send(e.message)
    } 

})  


// Bank transfer
app.patch("/users/transfer", (req: Request, res: Response) => {
    const {senderName, senderCpf, receiverName, receiverCpf, amountOfMoney} = req.body
    let error = 400

    try {
        if (!senderName && !senderCpf && !receiverName && !receiverCpf && !amountOfMoney) {
            error = 422
            throw new Error('É obrigatório fornecer o nome e o CPF do usuário que irá fazer a transferência, o nome e o CPF do usuário que irá receber a transferência e a quantia que será transferida.')
        } else if (!senderName) {
            error = 422
            throw new Error('É obrigatório fornecer o nome do usuário que irá fazer a transferência.')
        } else if (!senderCpf) {
            error = 422
            throw new Error('É obrigatório fornecer o CPF do usuário que irá fazer a transferência.')
        } else if (!receiverName) {
            error = 422
            throw new Error('É obrigatório fornecer o nome do usuário que irá receber a transferência.')
        } else if (!receiverCpf) {
            error = 422
            throw new Error('É obrigatório fornecer o CPF do usuário que irá receber a transferência.')
        } else if (!amountOfMoney) {
            error = 422
            throw new Error('É obrigatório fornecer o valor que será transferido.')
        }

        const userThatWillTransferExists = userAccounts.filter(item => item.name === senderName && item.cpf === senderCpf)
        if (userThatWillTransferExists.length === 0) {
            error = 422
            throw new Error('Os dados do usuário que irá fazer a transferência estão incorretos.')
        }

        const userThatWillReceiveExists = userAccounts.filter(item => item.name === receiverName && item.cpf === receiverCpf)
        if (userThatWillReceiveExists.length === 0) {
            error = 422
            throw new Error('Os dados do usuário que irá receber a transferência estão incorretos.')
        }

        for (let user of userAccounts) {
            if (user.name === senderName) {
                if (user.balance >= amountOfMoney) {
                    user.balance = user.balance - Number(amountOfMoney)
                } else {
                    error = 401
                    throw new Error('Não há saldo suficiente na conta do usuário para realizar a transferência.')
                }
            }
            if (user.name === receiverName) {
                user.balance = user.balance + Number(amountOfMoney)
            }
        }

        res.status(201).send(userAccounts)

    } catch (err: any) {
        res.status(error).send(err.message)
    }
})



app.listen(3003, () => {
    console.log("Server is running in http://localhost:3003")
})