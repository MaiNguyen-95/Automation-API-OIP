// import axios from "axios";

// export async function getServiceToken(service: string): Promise<string> {
//     const response = await axios.post(
//         process.env.OAUTH_URL!,
//         new URLSearchParams({
//             grant_type: "client_credentials",
//             client_id: process.env[`${service.toUpperCase()}_CLIENT_ID`]!,
//             client_secret: process.env[`${service.toUpperCase()}_CLIENT_SECRET`]!,
//         }),
//         {
//             headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         },
//     );

//     return response.data.access_token;
// }
