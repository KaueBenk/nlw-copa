import {Heading, useToast, VStack} from "native-base";
import {Header} from "../components/Header";

import {Input} from "../components/Input";
import {Button} from "../components/Button";
import {api} from "../services/api";
import {useState} from "react";
import {useNavigation} from "@react-navigation/native";

export function Find() {
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState("");

  const toast = useToast();
  const {navigate} = useNavigation();

  async function handleJoinPool() {
    try {
      setIsLoading(true);

      if (!code.trim) {
        return toast.show({
          title: 'Informe o código',
          placement: "top",
          bgColor: "red.500",
        });
      }

      await api.post("/polls/join", {code});

      toast.show({
        title: 'Entrou no bolão',
        placement: "top",
        bgColor: "green.500",
      })

      navigate('polls')

    } catch (error) {
      console.log(error.response);
      setIsLoading(false);

      if (error.response?.data?.message === 'Pool not found') {
        return toast.show({
          title: 'Bolão não encontrado',
          placement: "top",
          bgColor: "red.500",
        });
      }

      if (error.response?.data?.message === 'User already joined') {
        return toast.show({
          title: 'Você já está nesse bolão',
          placement: "top",
          bgColor: "red.500",
        });
      }

      toast.show({
        title: "Não foi possível encontrar o bolão",
        placement: "top",
        bgColor: "red.500",
      });

    }
  }

  return (
    <VStack flex={1} bgColor="gray.900">
      <Header title={"Buscar por código"} showBackButton={true}/>

      <VStack mt={8} mx={5} alignItems={"center"}>

        <Heading fontFamily={"heading"} color={"white"} fontSize={"xl"} mb={8} textAlign={"center"}>
          Encontre um bolão através de {"\n"} seu código único
        </Heading>

        <Input
          placeholder={"Qual o código do bolão?"}
          mb={2}
          autoCapitalize={"characters"}
          onChangeText={setCode}
        />

        <Button
          title={"BUSCAR BOLÃO"}
          mt={5}
          isLoading={isLoading}
          onPress={handleJoinPool}
        />

      </VStack>
    </VStack>
  )

}