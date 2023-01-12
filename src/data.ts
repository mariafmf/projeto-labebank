import { UserAccount } from "./types"

export const userAccounts: UserAccount[] = [
    {
        id: '001',
        name: 'Francine Hahn',
        cpf: '00985662110',
        dateOfBirth: '04/06/1991',
        balance: 20000,
        statement: [
            {value: 150, date: '01/06/2022', description: 'Compra de uma bolsa'},
            {value: 25, date: '10/08/2022', description: 'Almoço'},
            {value: 49.90, date: '20/09/2022', description: 'Compra de uma blusa'}
        ]
    },
    {
        id: '002',
        name: 'Giovana Inez Vieira',
        cpf: '12345678910',
        dateOfBirth: '01/04/1999',
        balance: 30000,
        statement: [
            {value: 50, date: '10/05/2022', description: 'Cafeteria'},
            {value: 29.90, date: '05/06/2022', description: 'Estacionamento'},
            {value: 320.80, date: '18/07/2022', description: 'Compra de um tênis'},
            {value: 39.90, date: '30/10/2022', description: 'Almoço'}
        ]
    },
    {
        id: '003',
        name: 'Maria Fernandez',
        cpf: '55012342910',
        dateOfBirth: '07/10/1995',
        balance: 15000,
        statement: [
            {value: 250, date: '01/08/2022', description: 'Compra de um casaco'},
            {value: 32.90, date: '10/09/2022', description: 'Almoço'},
            {value: 55, date: '20/10/2022', description: 'Pet shop'}
        ]
    }
]