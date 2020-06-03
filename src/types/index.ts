import { ImageSourcePropType } from "react-native";

interface Seller {
    id: string,
    name: string
}

interface CartItem {
    id: string,
    name: string,
    description?: string,
    images: Array<ImageSourcePropType>,
    price: number | null,
    qty: number,
    seller: Seller,
    tags: string[]
}

export interface ServiceItem extends CartItem {
    type: 'service',
    description: string,
    qty: 1
}

export interface ProductItem extends CartItem {
    type: 'product'
    brand?: string;
    format: string,
    price: number,

}

export type Item = ServiceItem | ProductItem;