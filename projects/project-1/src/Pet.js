export default class Pet
{
    constructor(id, name, image, breed, gender, age, link)
    {
        Object.assign(this, { id, name, image, breed, gender, age, link });
    }
}