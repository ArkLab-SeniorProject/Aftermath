import { Block } from 'baseui/block';
import { Button, KIND } from 'baseui/button';
import { Checkbox } from 'baseui/checkbox';
import { Input } from 'baseui/input';
import { Radio, RadioGroup } from 'baseui/radio';
import { Spinner } from 'baseui/spinner';
import { useState } from 'react';

const sectionStyle = {
  padding: '24px',
  border: '1px solid #e0e0e0',
  borderRadius: '16px',
  backgroundColor: '#ffffff',
};

export default function StyleGuideRoute() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [checked, setChecked] = useState(true);
  const [radioValue, setRadioValue] = useState('one');

  return (
    <Block
      $style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '32px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        fontFamily: 'Inter, Arial, sans-serif',
        color: '#1a1a1a',
      }}
    >
      <Block as='h1' $style={{ margin: 0, fontSize: '2rem' }}>
        Base Web style guide
      </Block>
      <Block as='p' $style={{ margin: 0, color: '#6b6b6b' }}>
        Reference for the Base Web components and design tokens used in Aftermath.
      </Block>

      <Block $style={sectionStyle}>
        <Block as='h2' $style={{ margin: '0 0 16px', fontSize: '1.25rem' }}>
          Buttons
        </Block>
        <Block $style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <Button kind={KIND.primary}>Primary action</Button>
          <Button kind={KIND.secondary}>Secondary action</Button>
          <Button kind={KIND.tertiary}>Tertiary action</Button>
          <Button disabled>Disabled</Button>
          <Button onClick={() => setDialogOpen((open) => !open)}>Toggle inline message</Button>
        </Block>
        {dialogOpen && (
          <Block as='output' $style={{ marginTop: '16px' }}>
            Base Web buttons use Styletron styling.
          </Block>
        )}
      </Block>

      <Block $style={sectionStyle}>
        <Block as='h2' $style={{ margin: '0 0 16px', fontSize: '1.25rem' }}>
          Inputs
        </Block>
        <Block $style={{ maxWidth: '420px', display: 'grid', gap: '12px' }}>
          <Input
            value={inputValue}
            onChange={(event) => setInputValue(event.currentTarget.value)}
            placeholder='Enter text'
            aria-label='Example text input'
          />
          <Checkbox checked={checked} onChange={(event) => setChecked(event.currentTarget.checked)}>
            Checkbox
          </Checkbox>
          <RadioGroup
            value={radioValue}
            onChange={(event) => setRadioValue(event.currentTarget.value)}
            aria-label='Example radio group'
          >
            {[
              <Radio key='one' value='one'>
                Option one
              </Radio>,
              <Radio key='two' value='two'>
                Option two
              </Radio>,
            ]}
          </RadioGroup>
        </Block>
      </Block>

      <Block $style={sectionStyle}>
        <Block as='h2' $style={{ margin: '0 0 16px', fontSize: '1.25rem' }}>
          Feedback and status
        </Block>
        <Block $style={{ display: 'grid', gap: '16px' }}>
          <Block
            role='progressbar'
            aria-valuenow={65}
            aria-valuemin={0}
            aria-valuemax={100}
            $style={{
              height: '6px',
              borderRadius: '999px',
              backgroundColor: '#e5e5e5',
              overflow: 'hidden',
            }}
          >
            <Block $style={{ width: '65%', height: '100%', backgroundColor: '#1a1a1a' }} />
          </Block>
          <Block $style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Spinner $size='24px' />
            <Block as='span' $style={{ color: '#176b37' }}>
              Ready
            </Block>
            <Block as='span' $style={{ color: '#7a4d00' }}>
              In progress
            </Block>
          </Block>
        </Block>
      </Block>
    </Block>
  );
}
