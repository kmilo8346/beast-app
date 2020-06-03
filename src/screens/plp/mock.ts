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
            }
        ]
    },
]


// export const sections: Section[] = [
//     {
//         tag: 'Don Camilo',
//         data: [
//             {
//                 type: 'product',
//                 id: '239832kd',
//                 name: 'Pie de gauyaba',
//                 brand: 'Don Camilo',
//                 format: '1 un',
//                 images: [require('../../../assets/items/cake.png')],
//                 price: 2000,
//                 qty: 1,
//                 seller: {
//                     id: '234ADD',
//                     name: 'Don Camilo'
//                 },
//                 tags: ['Don Camilo', 'dulce'],
//             },
//             {
//                 type: 'service',
//                 id: '234234kd',
//                 name: 'Corte de cabello',
//                 description: 'Hacemos todo tipo de cortes. Se atiende a domicilio de 8 am a 2 pm',
//                 images: [require('../../../assets/items/barber.png')],
//                 price: 7000,
//                 qty: 1,
//                 seller: {
//                     id: '234ADD',
//                     name: 'Don Camilo'
//                 },
//                 tags: ['Don Camilo'],
//             },
//             {
//                 type: 'service',
//                 id: '234235kd',
//                 name: 'Corte de cabello2',
//                 description: 'Hacemos todo tipo de cortes. Se atiende a domicilio de 8 am a 2 pm',
//                 images: [require('../../../assets/items/barber.png')],
//                 price: 7000,
//                 qty: 1,
//                 seller: {
//                     id: '234ADD',
//                     name: 'Don Camilo'
//                 },
//                 tags: ['Don Camilo'],
//             },
//             {
//                 type: 'service',
//                 id: '234236kd',
//                 name: 'Corte de cabello',
//                 description: 'Hacemos todo tipo de cortes. Se atiende a domicilio de 8 am a 2 pm',
//                 images: [require('../../../assets/items/barber.png')],
//                 price: 7000,
//                 qty: 1,
//                 seller: {
//                     id: '234ADD',
//                     name: 'Don Camilo'
//                 },
//                 tags: ['Don Camilo'],
//             },
//             {
//                 type: 'service',
//                 id: '234237kd',
//                 name: 'Corte de cabello',
//                 description: 'Hacemos todo tipo de cortes. Se atiende a domicilio de 8 am a 2 pm',
//                 images: [require('../../../assets/items/barber.png')],
//                 price: 7000,
//                 qty: 1,
//                 seller: {
//                     id: '234ADD',
//                     name: 'Don Camilo'
//                 },
//                 tags: ['Don Camilo'],
//             },
//             {
//                 type: 'service',
//                 id: '234238kd',
//                 name: 'Corte de cabello',
//                 description: 'Hacemos todo tipo de cortes. Se atiende a domicilio de 8 am a 2 pm',
//                 images: [require('../../../assets/items/barber.png')],
//                 price: 7000,
//                 qty: 1,
//                 seller: {
//                     id: '234ADD',
//                     name: 'Don Camilo'
//                 },
//                 tags: ['Don Camilo'],
//             }
//         ]
//     },
//     {
//         tag: 'Don Pepe',
//         data: [
//             {
//                 type: 'product',
//                 id: '239832kd',
//                 name: 'Pie de gauyaba',
//                 brand: 'Don Camilo',
//                 format: '1 un',
//                 images: [require('../../../assets/items/cake.png')],
//                 price: 2000,
//                 qty: 1,
//                 seller: {
//                     id: '121AZZ',
//                     name: 'Don Pepe'
//                 },
//                 tags: ['Don Pepe', 'dulce'],
//             },
//             {
//                 type: 'service',
//                 id: '234234kd',
//                 name: 'Corte de cabello',
//                 description: 'Hacemos todo tipo de cortes. Se atiende a domicilio de 8 am a 2 pm',
//                 images: [require('../../../assets/items/barber.png')],
//                 price: 7000,
//                 qty: 1,
//                 seller: {
//                     id: '121AZZ',
//                     name: 'Don Pepe'
//                 },
//                 tags: ['Don Pepe'],
//             }
//         ]
//     },
// ]