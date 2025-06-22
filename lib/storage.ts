const DB_NAME = "StoryToVideoApp"
const DB_VERSION = 1
const STORE_NAME = "images"

interface ImageData {
  key: string
  data: Record<string, string>
  timestamp: number
}

// Initialize IndexedDB
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "key" })
        store.createIndex("timestamp", "timestamp", { unique: false })
      }
    }
  })
}

// Save images to IndexedDB
export const saveImages = async (key: string, images: Record<string, string>): Promise<void> => {
  try {
    const db = await initDB()
    const transaction = db.transaction([STORE_NAME], "readwrite")
    const store = transaction.objectStore(STORE_NAME)

    const imageData: ImageData = {
      key,
      data: images,
      timestamp: Date.now(),
    }

    await new Promise<void>((resolve, reject) => {
      const request = store.put(imageData)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })

    console.log(`Saved ${Object.keys(images).length} images to IndexedDB with key: ${key}`)
  } catch (error) {
    console.error("Failed to save images to IndexedDB:", error)
    throw error
  }
}

// Load images from IndexedDB
export const loadImages = async (key: string): Promise<Record<string, string> | null> => {
  try {
    const db = await initDB()
    const transaction = db.transaction([STORE_NAME], "readonly")
    const store = transaction.objectStore(STORE_NAME)

    const result = await new Promise<ImageData | null>((resolve, reject) => {
      const request = store.get(key)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })

    if (result) {
      console.log(`Loaded ${Object.keys(result.data).length} images from IndexedDB with key: ${key}`)
      return result.data
    }

    return null
  } catch (error) {
    console.error("Failed to load images from IndexedDB:", error)
    return null
  }
}

// Delete images from IndexedDB
export const deleteImages = async (key: string): Promise<void> => {
  try {
    const db = await initDB()
    const transaction = db.transaction([STORE_NAME], "readwrite")
    const store = transaction.objectStore(STORE_NAME)

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(key)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })

    console.log(`Deleted images with key: ${key}`)
  } catch (error) {
    console.error("Failed to delete images from IndexedDB:", error)
    throw error
  }
}

// Clear all stored images
export const clearAllImages = async (): Promise<void> => {
  try {
    const db = await initDB()
    const transaction = db.transaction([STORE_NAME], "readwrite")
    const store = transaction.objectStore(STORE_NAME)

    await new Promise<void>((resolve, reject) => {
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })

    console.log("Cleared all images from IndexedDB")
  } catch (error) {
    console.error("Failed to clear images from IndexedDB:", error)
    throw error
  }
}

// Get storage usage info
export const getStorageInfo = async (): Promise<{ keys: string[]; totalSize: number }> => {
  try {
    const db = await initDB()
    const transaction = db.transaction([STORE_NAME], "readonly")
    const store = transaction.objectStore(STORE_NAME)

    const keys: string[] = []
    let totalSize = 0

    await new Promise<void>((resolve, reject) => {
      const request = store.openCursor()
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          const imageData = cursor.value as ImageData
          keys.push(imageData.key)
          totalSize += JSON.stringify(imageData.data).length
          cursor.continue()
        } else {
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })

    return { keys, totalSize }
  } catch (error) {
    console.error("Failed to get storage info:", error)
    return { keys: [], totalSize: 0 }
  }
}
