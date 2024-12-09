"use client"
import Image from 'next/image'
import { FormEvent, Fragment, useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, Transition} from '@headlessui/react'
import { addUserEmailToProduct, fetchAccessTokenFromRefreshToken, findRefreshTokenFromSender } from '@/lib/actions'

interface Props{
    productId: string
}

const Modal = ({productId}: Props) => {
    let [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [email, setEmail] = useState('');
    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        //getting user authorization
        // await getUserAuthorization();
        try {
            const refreshToken = await findRefreshTokenFromSender();
            const accessToken = await fetchAccessTokenFromRefreshToken(refreshToken);
            if(!accessToken) throw new Error('Access token could not be fetched');
            await addUserEmailToProduct(productId, email, accessToken? accessToken : '',);
            setIsSubmitting(false);
            setEmail('');
            closeModal();
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <>
            <button type='button' className="btn" onClick={openModal}>Track</button>

            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as='div' open={isOpen} onClose={closeModal} className="relative z-50 dialog-container">
                    <div className='min-h-screen px-4 text-center'>
                        <Transition
                            as={Fragment}
                            appear
                            show
                            enter='ease-out duration-300'
                            enterFrom='opacity-0'
                            enterTo='opacity-100'
                            leave='ease-in duration-200'
                            leaveFrom='opacity-100'
                            leaveTo='opacity-0'>

                            <DialogBackdrop
                            onClick={closeModal}
                            className='fixed inset-0' />

                        </Transition>

                        <span className='inline-block h-screen align-middle' aria-hidden='true' />

                        <Transition
                            as={Fragment}
                            appear
                            show
                            enter='ease-out duration-300'
                            enterFrom='opacity-0  scale-95'
                            enterTo='opacity-100 scale-100'
                            leave='ease-in duration-200'
                            leaveFrom='opacity-100 scale-100'
                            leaveTo='opacity-0 scale-95'>

                            <div className='dialog-content' onClick={(e)  => e.stopPropagation()}>
                                <div className='flex flex-col '>
                                    <div className='flex justify-between'>
                                        <div className='p-3 border border-gray-200 rounded-10'>
                                            <Image
                                            src='/assets/icons/logo.svg'
                                            alt='logo'
                                            width={28}
                                            height={28}
                                            />
                                        </div>

                                        <Image
                                        src='/assets/icons/x-close.svg'
                                        alt='close'
                                        width={24}
                                        height={24}
                                        className='cursor-pointer'
                                        onClick={closeModal}
                                        />
                                    </div>

                                    <h4 className='dialog-head_text'>
                                        Stay updated with product pricing alerts right in your inbox!
                                    </h4>

                                    <p className='text-sm text-gray-600 mt-2'>Never miss a bargain again with our timely alerts</p>
                                </div>
                                <form className='flex flex-col mt-5' onSubmit={handleSubmit}>
                                    <label htmlFor="email" className='text-sm font-medium text-gray-700'>Email Address:</label>
                                    <div className='dialog-input_container'>
                                        <Image
                                        src='/assets/icons/mail.svg'
                                        alt='mail'
                                        width={18}
                                        height={18}
                                        />

                                        <input required value={email} onChange={(e) => setEmail(e.target.value)} type='email' id='email' placeholder='Enter your email' className='dialog-input' />
                                    </div>

                                    <button type='submit' className='dialog-btn'>{isSubmitting?'Submitting' : 'Track'}</button>
                                </form>
                            </div>
                        </Transition>
                    </div>
                </Dialog>
            </Transition>

        </>
    )
}

export default Modal
