import { Item } from "../../types";

export interface Section {
    tag: String,
    data: Item[]
}

export const sections: Section[] = [
    {
        tag: 'Don Camilo',
        data: [
            {
                type: 'product',
                id: '239832kd',
                name: 'Pie de gauyaba',
                brand: 'Don Camilo',
                format: '1 un',
                images: [require('../../../assets/items/cake.png')],
                price: 2000,
                qty: 1,
                seller: {
                    id: '234ADD',
                    name: 'Don Camilo'
                },
                tags: ['Don Camilo', 'dulce'],
            },
            {
                type: 'service',
                id: '234234kd',
                name: 'Corte de cabello',
                description: 'Hacemos todo tipo de cortes. Se atiende a domicilio de 8 am a 2 pm',
                images: [require('../../../assets/items/barber.png')],
                price: 7000,
                qty: 1,
                seller: {
                    id: '234ADD',
                    name: 'Don Camilo'
                },
                tags: ['Don Camilo'],
            }
        ]
    },
    {
        tag: 'Don Pepe',
        data: [
            {
                type: 'product',
                id: '239832kd',
                name: 'Pie de gauyaba',
                brand: 'Don Camilo',
                format: '1 un',
                images: [require('../../../assets/items/cake.png')],
                price: 2000,
                qty: 1,
                seller: {
                    id: '121AZZ',
                    name: 'Don Pepe'
                },
                tags: ['Don Pepe', 'dulce'],
            },
            {
                type: 'service',
                id: '234234kd',
                name: 'Corte de cabello',
                description: 'Hacemos todo tipo de cortes. Se atiende a domicilio de 8 am a 2 pm',
                images: [require('../../../assets/items/barber.png')],
                price: 7000,
                qty: 1,
                seller: {
                    id: '121AZZ',
                    name: 'Don Pepe'
                },
                tags: ['Don Pepe'],
            }
        ]
    },
]