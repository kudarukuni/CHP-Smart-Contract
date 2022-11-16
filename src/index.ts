import { Metaplex, keypairIdentity, bundlrStorage, toMetaplexFile, NftWithToken,} from "@metaplex-foundation/js"
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js"
import { initializeKeypair } from "./initializeKeypair"
import * as web3 from "@solana/web3.js"
import dotenv from "dotenv"
import * as fs from "fs"

const tokenName = "ChipokoNFT"
const description = "A collection of generic art of a Chipoko"
const symbol = "CHP"
const sellerFeeBasisPoints = 100
const imageFile = "chipoko15.png"

async function createNft(metaplex: Metaplex, uri: string): Promise<NftWithToken> {
  const { nft } = await metaplex.nfts().create({ uri: uri, name: tokenName, sellerFeeBasisPoints: sellerFeeBasisPoints, symbol: symbol, })
  console.log(`Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`)
  return nft
}

async function updateNft(metaplex: Metaplex, uri: string, mintAddress: PublicKey) {
  const nft = await metaplex.nfts().findByMint({ mintAddress })
  await metaplex.nfts().update({ nftOrSft: nft, name: tokenName, symbol: symbol, uri: uri, sellerFeeBasisPoints: sellerFeeBasisPoints, })
  console.log(`Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`)
}

async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"))
  const user = await initializeKeypair(connection)
  console.log("Public Key: ", user.publicKey.toBase58())
  const metaplex = Metaplex.make(connection).use(keypairIdentity(user)).use(bundlrStorage({ address: "https://devnet.bundlr.network", providerUrl: "https://api.devnet.solana.com", timeout: 60000, }))
  const buffer = fs.readFileSync("src/" + imageFile)
  const file = toMetaplexFile(buffer, imageFile)
  const imageUri = await metaplex.storage().upload(file)
  console.log("image uri:", imageUri)
  const { uri } = await metaplex.nfts().uploadMetadata({ name: tokenName, description: description, image: imageUri, })
  console.log("metadata uri:", uri)
  //await createNft(metaplex, uri)
  const mintAddress = new PublicKey("B24D62G1vPByqQkCzoTWBPBVF1oSN4nwXNQNNMoNr4UL")
  await updateNft(metaplex, uri, mintAddress)
}

main()
  .then(() => {
    console.log("Finished successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })
