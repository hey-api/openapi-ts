import './App.css';

import * as Form from '@radix-ui/react-form';
import { PlusIcon } from '@radix-ui/react-icons';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Section,
  TextField,
} from '@radix-ui/themes';
import OpenAI from 'openai';
import { useState } from 'react';

import { client as baseClient } from './client/client.gen';
import { OpenAi } from './client/sdk.gen';

const sdk = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

baseClient.setConfig({
  auth() {
    return import.meta.env.VITE_OPENAI_API_KEY;
  },
});

const client = new OpenAi({
  client: baseClient,
});

function App() {
  const [isRequiredNameError] = useState(false);

  const onCreateResponse = async (values: FormData) => {
    const response = await sdk.responses.create({
      input: values.get('input') as string,
      model: 'gpt-5-nano',
    });

    console.log(response.output_text);
    const { data, error } = await client.createResponse({
      body: {
        input: values.get('input') as string,
        model: 'gpt-5-nano',
      },
    });
    if (error) {
      console.log(error);
      return;
    }
    console.log(data?.output);
  };

  return (
    <Box
      style={{ background: 'var(--gray-a2)', borderRadius: 'var(--radius-3)' }}
    >
      <Container size="1">
        <Section size="1" />
        <Flex align="center">
          <a className="shrink-0" href="https://heyapi.dev/" target="_blank">
            <img
              src="https://heyapi.dev/logo.png"
              className="h-16 w-16 transition duration-300 will-change-auto"
              alt="Hey API logo"
            />
          </a>
          <Heading>@hey-api/openapi-ts 🤝 OpenAI</Heading>
        </Flex>
        <Section size="1" />
        <Flex direction="column" gapY="2">
          <Form.Root
            className="w-[400px]"
            onSubmit={(event) => {
              event.preventDefault();
              onCreateResponse(new FormData(event.currentTarget));
            }}
          >
            <Form.Field className="grid mb-[10px]" name="input">
              <div className="flex items-baseline justify-between">
                <Form.Label className="text-[15px] font-medium leading-[35px] text-white">
                  Input
                </Form.Label>
                {isRequiredNameError && (
                  <Form.Message className="text-[13px] text-white opacity-[0.8]">
                    Please enter a name
                  </Form.Message>
                )}
                <Form.Message
                  className="text-[13px] text-white opacity-[0.8]"
                  match="valueMissing"
                >
                  Please enter an input
                </Form.Message>
              </div>
              <Form.Control asChild>
                <TextField.Root
                  placeholder="Write a one-sentence bedtime story about a unicorn."
                  name="input"
                  type="text"
                  required
                />
              </Form.Control>
            </Form.Field>
            <Flex gapX="2">
              <Form.Submit asChild>
                <Button type="submit">
                  <PlusIcon /> Create Response
                </Button>
              </Form.Submit>
              {/* <Button onClick={onUpdatePet} type="button">
                <ReloadIcon /> Update Pet
              </Button> */}
            </Flex>
          </Form.Root>
        </Flex>
        <Section size="1" />
      </Container>
    </Box>
  );
}

export default App;
