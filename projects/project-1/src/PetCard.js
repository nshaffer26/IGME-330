export default class PetCard
{
    constructor(id, name, image, breed, gender, age, link)
    {
        Object.assign(this, { id, name, image, breed, gender, age, link });
    }
}