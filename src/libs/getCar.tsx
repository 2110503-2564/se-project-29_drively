export default async function getCar(id:string) {
    const response = await fetch(`https://back-end-car.vercel.app/api/cars/${id}`)
    if(!response.ok) {
        throw new Error("Failed to fetch cars")
    }

    return await response.json()
}