
interface Options {
    prompt: string;

}


export const orthographyChecUseCase = async(options : Options )=> {

    const { prompt } = options;

    return {
        prompt: prompt,
        
    };

};