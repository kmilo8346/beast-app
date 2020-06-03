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
                type: 'service',
                id: '-1',
                name: 'Corte de cabello en torta',
                description: 'Hacemos el mejor corte de cabello estilo torta de todo Santiago',
                images: [require('../../../assets/items/barber.png')],
                price: 7000,
                qty: 1,
                seller: {
                    id: '234ADD',
                    name: 'Don Camilo'
                },
                tags: ['Don Camilo'],
            },
            {
                type: 'service',
                id: '0',
                name: 'Corte de cabello',
                description: 'Hacemos todo tipo de corte de cabello. Atención a domicilio',
                images: [require('../../../assets/items/barber.png')],
                price: null,
                qty: 1,
                seller: {
                    id: '234ADD',
                    name: 'Don Camilo'
                },
                tags: ['Don Camilo'],
            },
            {
                type: 'product',
                id: '1',
                name: 'Cake de Guayaba',
                brand: 'Don Camilo',
                format: '1 un',
                images: [require('../../../assets/items/cake.png')],
                price: 2000,
                qty: 0,
                seller: {
                    id: '234ADD',
                    name: 'Don Camilo'
                },
                tags: ['Don Camilo', 'dulce'],
            },
            {
                type: 'product',
                id: '2',
                name: 'Torta Helada',
                brand: 'Don Camilo',
                format: 'Torta 1 kg',
                images: [require('../../../assets/items/torta_helada.jpg')],
                price: 3990,
                qty: 1,
                seller: {
                    id: '234ADD',
                    name: 'Don Camilo'
                },
                tags: ['Don Camilo', 'dulce'],
            },
            {
                type: 'product',
                id: '3',
                name: 'Torta Microondas',
                brand: 'Don Camilo',
                format: '800 g',
                images: [require('../../../assets/items/torta_microondas.jpg')],
                price: 6990,
                qty: 1,
                seller: {
                    id: '234ADD',
                    name: 'Don Camilo'
                },
                tags: ['Don Camilo', 'dulce'],
            },
            {
                type: 'product',
                id: '4',
                name: 'Torta Nestle 😝',
                brand: 'Don Camilo',
                format: '800 g',
                images: [require('../../../assets/items/torta_nestle.jpeg')],
                price: 4990,
                qty: 1,
                seller: {
                    id: '234ADD',
                    name: 'Don Camilo'
                },
                tags: ['Don Camilo', 'dulce'],
            },
            {
                type: 'product',
                id: '5',
                name: 'Torta Vainilla',
                brand: 'Don Camilo',
                format: '800 g',
                images: [require('../../../assets/items/torta_vainilla.jpg')],
                price: 990,
                qty: 0,
                seller: {
                    id: '234ADD',
                    name: 'Don Camilo'
                },
                tags: ['Don Camilo', 'dulce'],
            },
        ]
    },
    {
        tag: 'Don Pepe',
        data: [
            {
                type: 'product',
                id: '239832kd',
                name: 'Pie de gauyaba',
                brand: 'Don Pepe',
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
        ]
    },
]