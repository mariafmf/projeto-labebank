export type UserAccount = {
    id: string,
    name: string,
    cpf: string,
    dateOfBirth: string,
    balance: number,
    statement: Statement[]
}

export type Statement = {
    value: number,
    date: string,
    description: string
}