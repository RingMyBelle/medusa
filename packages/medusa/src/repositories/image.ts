import { In } from "typeorm"
import { dataSource } from "../loaders/database"
import { Image } from "../models/image"

export const ImageRepository = dataSource.getRepository(Image).extend({
  async upsertImages(imageUrls: string[]) {
    const existingImages = await this.find({
      where: {
        url: In(imageUrls),
      },
    })
    const existingImagesMap = new Map(
      existingImages.map<[string, Image]>((img) => [img.url, img])
    )

    const upsertedImgs: Image[] = []

    for (const url of imageUrls) {
      const aImg = existingImagesMap.get(url)
      if (aImg) {
        upsertedImgs.push(aImg)
      } else {
        const newImg = this.create({ url })
        const savedImg = await this.save(newImg)
        upsertedImgs.push(savedImg)
      }
    }

    return upsertedImgs
  },
})

export default ImageRepository
