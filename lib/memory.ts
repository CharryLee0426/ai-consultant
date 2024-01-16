import { Redis } from "@upstash/redis";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";

export type ConsultantKey = {
  consultantName: string;
  modelName: string;
  userId: string;
};

export class MemoryManager {
  private static instance: MemoryManager;
  private history: Redis;
  private vectorDBClient: PineconeClient;

  public constructor() {
    this.history = Redis.fromEnv();
    this.vectorDBClient = new PineconeClient();
  }

  public async init() {
    if (this.vectorDBClient instanceof PineconeClient) {
      await this.vectorDBClient.init({
        apiKey: process.env.PINECONE_API_KEY!,
        environment: process.env.PINECONE_ENVIRONMENT!,
      });
    }
  }

  public async vectorSearch(
    recentChatHistory: string,
    consultantFileName: string
  ) {
    const pineconeClient = <PineconeClient>this.vectorDBClient;

    // await this.vectorDBClient.init({
    //   environment: process.env.PINECONE_ENVIRONMENT!,
    //   apiKey: process.env.PINECONE_API_KEY!
    // });

    const pineconeIndex = pineconeClient.Index(
      process.env.PINECONE_INDEX as string || ""
    );

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
      // here is an api change which only accepts dev0.1.6
      { pineconeIndex }
    ); 

    const similarDocs = await vectorStore
      .similaritySearch(recentChatHistory, 3, { fileName: consultantFileName })
      .catch((err) => {
        console.log("WARNING: failed to get vector search results.", err);
      });
    return similarDocs;
  }

  public static async getInstance(): Promise<MemoryManager> {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
      await MemoryManager.instance.init();
    }
    return MemoryManager.instance;
  }

  private generateRedisConsultantKey(consultantKey: ConsultantKey): string {
    return `${consultantKey.consultantName}-${consultantKey.modelName}-${consultantKey.userId}`;
  }

  public async writeToHistory(text: string, consultantKey: ConsultantKey) {
    if (!consultantKey || typeof consultantKey.userId == "undefined") {
      console.log("Consultant key set incorrectly");
      return "";
    }

    const key = this.generateRedisConsultantKey(consultantKey);
    const result = await this.history.zadd(key, {
      score: Date.now(),
      member: text,
    });

    return result;
  }

  public async readLatestHistory(consultantKey: ConsultantKey): Promise<string> {
    if (!consultantKey || typeof consultantKey.userId == "undefined") {
      console.log("Consultant key set incorrectly");
      return "";
    }

    const key = this.generateRedisConsultantKey(consultantKey);
    let result = await this.history.zrange(key, 0, Date.now(), {
      byScore: true,
    });

    result = result.slice(-30).reverse();
    const recentChats = result.reverse().join("\n");
    return recentChats;
  }

  public async seedChatHistory(
    seedContent: String,
    delimiter: string = "\n",
    consultantKey: ConsultantKey
  ) {
    const key = this.generateRedisConsultantKey(consultantKey);
    if (await this.history.exists(key)) {
      console.log("User already has chat history");
      return;
    }

    const content = seedContent.split(delimiter);
    let counter = 0;
    for (const line of content) {
      await this.history.zadd(key, { score: counter, member: line });
      counter += 1;
    }
  }
}
